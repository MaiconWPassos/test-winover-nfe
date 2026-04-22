import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErpFicticioService } from '../erp/erp-ficticio.service';
import type { CreateNfeDto } from '../dto/create-nfe.dto';
import { NfeStatus, nfeStatusToApi } from '../entities/nfe-status.enum';
import {
  assertDestinatarioMatchesErpCliente,
  onlyDigitsCnpj,
} from '../domain/policies/destinatario-match.policy';
import {
  NFE_REPOSITORY,
  type INfeRepository,
} from '../domain/ports/nfe.repository.port';
import { NfeQueueService } from '../nfe-queue.service';

@Injectable()
export class CreateNfeUseCase {
  constructor(
    private readonly config: ConfigService,
    private readonly erp: ErpFicticioService,
    @Inject(NFE_REPOSITORY) private readonly nfeRepository: INfeRepository,
    private readonly queue: NfeQueueService,
  ) {}

  async execute(userId: string, dto: CreateNfeDto) {
    const customer = await this.erp.getClientePorCnpj(dto.cnpjDestinatario);
    assertDestinatarioMatchesErpCliente(dto, customer);

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
      userId,
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
}
