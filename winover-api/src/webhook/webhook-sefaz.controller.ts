import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NfeRetornoSefazService } from '../nfe/nfe-retorno-sefaz.service';
import { RetornoSefazDto } from './dto/retorno-sefaz.dto';

@ApiTags('webhook-sefaz')
@Controller('webhook')
export class WebhookSefazController {
  constructor(private readonly retorno: NfeRetornoSefazService) {}

  private assertWebhookSecret(
    secretHeader: string | string[] | undefined,
  ): void {
    const expected = process.env.WEBHOOK_SEFAZ_SECRET?.trim();
    if (!expected) return;
    const got = Array.isArray(secretHeader)
      ? secretHeader[0]
      : secretHeader?.trim();
    if (got !== expected) {
      throw new UnauthorizedException('X-Webhook-Secret inválido ou ausente');
    }
  }

  @Post('retorno-sefaz')
  @ApiOperation({
    summary: 'Simula callback assíncrono da SEFAZ',
    description:
      'Finaliza uma NF-e em **processamento** como autorizada ou rejeitada. ' +
      'Use com **SEFAZ_CALLBACK_MODE=true** para o job não concluir sozinho e aguardar este POST. ' +
      'Se **WEBHOOK_SEFAZ_SECRET** estiver definido, envie o mesmo valor no cabeçalho **X-Webhook-Secret**.',
  })
  @ApiHeader({
    name: 'X-Webhook-Secret',
    required: false,
    description: 'Obrigatório quando WEBHOOK_SEFAZ_SECRET está configurado',
  })
  @ApiBody({ type: RetornoSefazDto })
  @ApiResponse({ status: 200, description: 'Retorno aplicado' })
  @ApiResponse({ status: 401, description: 'Segredo do webhook incorreto' })
  @ApiResponse({ status: 404, description: 'NF-e não encontrada' })
  @ApiResponse({
    status: 409,
    description: 'NF-e não está em processamento',
  })
  async retornoSefaz(
    @Body() dto: RetornoSefazDto,
    @Headers('x-webhook-secret') secret: string | undefined,
  ) {
    this.assertWebhookSecret(secret);
    if (dto.situacao === 'autorizada') {
      return this.retorno.aplicarAutorizacao(dto.nfeId, dto.protocolo);
    }
    return this.retorno.aplicarRejeicao(
      dto.nfeId,
      dto.codigoRejeicao!.trim(),
      dto.motivoRejeicao!.trim(),
    );
  }
}
