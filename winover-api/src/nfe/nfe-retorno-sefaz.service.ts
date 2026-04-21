import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NfeStatus } from './entities/nfe-status.enum';
import { NfeXmlBuilder } from './infrastructure/xml/nfe-xml.builder';
import { NfeRepository } from './repository/nfe.repository';

@Injectable()
export class NfeRetornoSefazService {
  constructor(
    private readonly nfeRepository: NfeRepository,
    private readonly xmlBuilder: NfeXmlBuilder,
  ) {}

  private async loadProcessingOrThrow(id: string) {
    const nfe = await this.nfeRepository.findById(id);
    if (!nfe) {
      throw new NotFoundException('NF-e não encontrada');
    }
    if (nfe.status !== NfeStatus.PROCESSING) {
      throw new ConflictException(
        `NF-e não está em processamento (status atual: ${nfe.status})`,
      );
    }
    return nfe;
  }

  async aplicarAutorizacao(
    nfeId: string,
    protocoloInformado?: string,
  ): Promise<{ id: string; status: string; protocolo?: string }> {
    const nfe = await this.loadProcessingOrThrow(nfeId);
    if (!nfe.accessKey) {
      throw new BadRequestException(
        'NF-e sem chave de acesso — conclua a etapa de montagem antes do retorno',
      );
    }
    const nfeLite = this.xmlBuilder.buildNFeLite(nfe);
    const protocol =
      protocoloInformado?.trim() ||
      `PROT${Date.now()}${Math.floor(Math.random() * 1e6)
        .toString()
        .padStart(6, '0')}`;

    nfe.protocolNumber = protocol;
    nfe.authorizedXml = this.xmlBuilder.wrapAuthorizedPayload(
      nfe.accessKey!,
      nfeLite,
      protocol,
    );
    nfe.rejectionCode = null;
    nfe.rejectionMessage = null;
    nfe.status = NfeStatus.AUTHORIZED;
    await this.nfeRepository.save(nfe);
    return { id: nfe.id, status: 'autorizada', protocolo: protocol };
  }

  async aplicarRejeicao(
    nfeId: string,
    codigo: string,
    motivo: string,
  ): Promise<{ id: string; status: string }> {
    const nfe = await this.loadProcessingOrThrow(nfeId);
    nfe.status = NfeStatus.REJECTED;
    nfe.rejectionCode = codigo;
    nfe.rejectionMessage = motivo;
    nfe.authorizedXml = null;
    nfe.protocolNumber = null;
    await this.nfeRepository.save(nfe);
    return { id: nfe.id, status: 'rejeitada' };
  }
}
