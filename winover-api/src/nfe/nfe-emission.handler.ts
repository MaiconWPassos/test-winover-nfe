import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NfeStatus } from './entities/nfe-status.enum';
import { NfeXmlBuilder } from './infrastructure/xml/nfe-xml.builder';
import { XmlSchemaValidator } from './infrastructure/xml/xml-schema.validator';
import { NfeRetornoSefazService } from './nfe-retorno-sefaz.service';
import { NfeRepository } from './repository/nfe.repository';
import { SefazMockService } from './sefaz/sefaz-mock.service';

@Injectable()
export class NfeEmissionHandler {
  private readonly logger = new Logger(NfeEmissionHandler.name);

  constructor(
    private readonly config: ConfigService,
    private readonly nfeRepository: NfeRepository,
    private readonly xmlBuilder: NfeXmlBuilder,
    private readonly xmlValidator: XmlSchemaValidator,
    private readonly sefaz: SefazMockService,
    private readonly retorno: NfeRetornoSefazService,
  ) {}

  async handle(nfeId: string): Promise<void> {
    const nfe = await this.nfeRepository.findById(nfeId);
    if (!nfe) {
      this.logger.error({ nfeId }, 'NF-e não encontrada para processamento');
      return;
    }
    if (nfe.status !== NfeStatus.PROCESSING) {
      this.logger.warn(
        { nfeId, status: nfe.status },
        'NF-e já finalizada — ignorando job',
      );
      return;
    }

    try {
      nfe.accessKey = this.buildMockAccessKey(nfe.numero);
      await this.nfeRepository.save(nfe);

      const nfeLite = this.xmlBuilder.buildNFeLite(nfe);
      await this.xmlValidator.assertValidAgainstNfeMockSchema(nfeLite);

      if (this.config.get('SEFAZ_CALLBACK_MODE', 'false') === 'true') {
        this.logger.log(
          { nfeId: nfe.id },
          'SEFAZ_CALLBACK_MODE — aguardando POST /webhook/retorno-sefaz',
        );
        return;
      }

      const sefaz = await this.sefaz.enviarNfe(nfeLite);
      if (!sefaz.ok) {
        await this.retorno.aplicarRejeicao(nfe.id, sefaz.code, sefaz.message);
        return;
      }

      await this.retorno.aplicarAutorizacao(nfe.id, sefaz.protocol);
    } catch (err: unknown) {
      this.logger.error(
        {
          nfeId,
          err: err instanceof Error ? err.message : String(err),
        },
        'Falha ao processar emissão',
      );
      await this.retorno.aplicarRejeicao(
        nfe.id,
        'PROC',
        err instanceof BadRequestException
          ? JSON.stringify(err.getResponse())
          : 'Erro interno ao processar NF-e',
      );
    }
  }

  private buildMockAccessKey(numero: number): string {
    const base = `${Date.now()}${numero}`.replace(/\D/g, '');
    return base.padEnd(44, '0').slice(0, 44);
  }
}
