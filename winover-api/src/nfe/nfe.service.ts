import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErpFicticioService } from './erp/erp-ficticio.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { NfeStatus, nfeStatusToApi } from './entities/nfe-status.enum';
import { NfeQueueService } from './nfe-queue.service';
import { NfeRepository } from './repository/nfe.repository';

function onlyDigitsCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

@Injectable()
export class NfeService {
  constructor(
    private readonly config: ConfigService,
    private readonly erp: ErpFicticioService,
    private readonly nfeRepository: NfeRepository,
    private readonly queue: NfeQueueService,
  ) {}

  async create(dto: CreateNfeDto) {
    const customer = await this.erp.getClientePorCnpj(dto.cnpjDestinatario);
    const cnpjDigits = onlyDigitsCnpj(dto.cnpjDestinatario);
    if (cnpjDigits !== customer.cnpj) {
      throw new BadRequestException(
        'CNPJ destinatário divergente do cadastro ERP',
      );
    }
    if (
      dto.ieDestinatario.trim().toUpperCase() !==
      customer.ie.trim().toUpperCase()
    ) {
      throw new BadRequestException(
        'IE destinatário divergente do cadastro ERP',
      );
    }
    if (dto.ufDestinatario.toUpperCase() !== customer.uf.toUpperCase()) {
      throw new BadRequestException(
        'UF destinatária divergente do cadastro ERP',
      );
    }

    const itemsPayload = [];
    for (const row of dto.itens) {
      const product = await this.erp.getProdutoPorCodigo(row.codigoProduto);
      itemsPayload.push({
        productId: product.id,
        codigoProduto: product.codigo,
        descricao: product.descricao,
        ncm: product.ncm,
        cfop: row.cfop,
        cst: row.cst,
        quantidade: String(row.quantidade),
        valorUnitario: String(row.valorUnitario),
      });
    }

    const numero = await this.nfeRepository.nextNumero();
    const emitCnpj = onlyDigitsCnpj(
      this.config.getOrThrow<string>('EMITENTE_CNPJ'),
    );
    const emitIe = this.config.getOrThrow<string>('EMITENTE_IE').trim();
    const emitUf = this.config
      .getOrThrow<string>('EMITENTE_UF')
      .trim()
      .toUpperCase();

    const nfe = this.nfeRepository.create({
      numero,
      status: NfeStatus.PROCESSING,
      customerId: customer.id,
      emitCnpj,
      emitIe,
      emitUf,
      items: itemsPayload,
    });

    const saved = await this.nfeRepository.save(nfe);
    this.queue.enqueueEmission(saved.id);

    return {
      id: saved.id,
      numero: saved.numero,
      status: nfeStatusToApi(NfeStatus.PROCESSING),
    };
  }

  async getStatus(id: string) {
    const nfe = await this.nfeRepository.findById(id);
    if (!nfe) {
      throw new NotFoundException('NF-e não encontrada');
    }
    return {
      id: nfe.id,
      numero: nfe.numero,
      status: nfeStatusToApi(nfe.status),
      protocolo: nfe.protocolNumber ?? undefined,
      codigoRejeicao: nfe.rejectionCode ?? undefined,
      motivoRejeicao: nfe.rejectionMessage ?? undefined,
      chaveAcesso: nfe.accessKey ?? undefined,
    };
  }

  async getAuthorizedXml(id: string): Promise<string> {
    const nfe = await this.nfeRepository.findById(id);
    if (!nfe) {
      throw new NotFoundException('NF-e não encontrada');
    }
    if (nfe.status !== NfeStatus.AUTHORIZED || !nfe.authorizedXml) {
      throw new NotFoundException('XML disponível apenas para NF-e autorizada');
    }
    return nfe.authorizedXml;
  }

  async listSummaries(limit: number) {
    const take = Math.min(200, Math.max(1, limit));
    const rows = await this.nfeRepository.findSummariesOrdered(take);
    return rows.map((n) => ({
      id: n.id,
      numero: n.numero,
      status: nfeStatusToApi(n.status),
      createdAt: n.createdAt.toISOString(),
      destinatario: {
        cnpj: n.customer.cnpj,
        razaoSocial: n.customer.razaoSocial,
      },
      chaveAcessoResumo:
        n.accessKey && n.accessKey.length > 8
          ? `${n.accessKey.slice(0, 6)}…${n.accessKey.slice(-4)}`
          : (n.accessKey ?? null),
    }));
  }

  async getDashboardStats() {
    const statsTz =
      this.config.get<string>('STATS_TIMEZONE')?.trim() || 'America/Sao_Paulo';
    const [byStatus, byDay, total] = await Promise.all([
      this.nfeRepository.countByStatus(),
      this.nfeRepository.countByDay(30, statsTz),
      this.nfeRepository.countTotal(),
    ]);
    let acumulado = 0;
    const porDiaAcumulado = byDay.map((d) => {
      acumulado += d.quantidade;
      return { dia: d.dia, acumulado };
    });
    return {
      total,
      porStatus: {
        processamento: byStatus[NfeStatus.PROCESSING],
        autorizada: byStatus[NfeStatus.AUTHORIZED],
        rejeitada: byStatus[NfeStatus.REJECTED],
      },
      porDia: byDay,
      porDiaAcumulado,
    };
  }
}
