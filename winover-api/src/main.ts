import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function corsOptionsFromEnv(): CorsOptions {
  const raw = process.env.CORS_ORIGINS?.trim();
  const list = raw
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  if (list.length > 0) {
    return {
      origin: list.length === 1 ? list[0] : list,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Webhook-Secret',
      ],
      credentials: false,
      maxAge: 86400,
    };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      origin: [
        'http://localhost:4321',
        'http://127.0.0.1:4321',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Webhook-Secret',
      ],
      credentials: false,
      maxAge: 86400,
    };
  }

  return {
    origin: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
    maxAge: 86400,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors(corsOptionsFromEnv());
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('API NF-e (mock SEFAZ)')
    .setDescription(
      'Microserviço de emissão simulada de NF-e com ERP fictício, validação XSD e autenticação JWT.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Authorize (cadeado) → JWT-auth → cole só o access_token (sem Bearer). Persiste ao recarregar a página.',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'API NF-e — docs',
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
void bootstrap();
