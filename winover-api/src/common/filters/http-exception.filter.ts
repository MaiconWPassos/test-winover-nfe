import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Erro interno' };

    const body =
      typeof payload === 'string'
        ? { message: payload }
        : (payload as Record<string, unknown>);

    const code =
      typeof body['error'] === 'string'
        ? body['error']
        : (HttpStatus[status] ?? 'ERROR');

    const rawMsg = body['message'];
    const message = Array.isArray(rawMsg)
      ? rawMsg.map((m) => String(m)).join('; ')
      : typeof rawMsg === 'string'
        ? rawMsg
        : rawMsg !== undefined && rawMsg !== null
          ? JSON.stringify(rawMsg)
          : 'Falha na requisição';

    if (status >= 500) {
      this.logger.error(
        { err: exception, path: request.url, method: request.method },
        message,
      );
    } else {
      this.logger.warn(
        { path: request.url, method: request.method, status, message },
        'Requisição rejeitada',
      );
    }

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      code,
      message,
      details: body['details'] ?? undefined,
    });
  }
}
