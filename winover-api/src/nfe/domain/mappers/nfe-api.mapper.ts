import type { Nfe } from '../../entities/nfe.entity';
import { NfeStatus, nfeStatusToApi } from '../../entities/nfe-status.enum';

export function accessKeyResumo(accessKey: string | null): string | null {
  if (!accessKey) return null;
  if (accessKey.length <= 8) return accessKey;
  return `${accessKey.slice(0, 6)}…${accessKey.slice(-4)}`;
}

export function toNfeStatusApiView(
  nfe: Pick<
    Nfe,
    | 'id'
    | 'numero'
    | 'status'
    | 'protocolNumber'
    | 'rejectionCode'
    | 'rejectionMessage'
    | 'accessKey'
  >,
) {
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

export function toNfeListSummaryView(
  nfe: Pick<Nfe, 'id' | 'numero' | 'status' | 'createdAt' | 'accessKey'> & {
    customer: { cnpj: string; razaoSocial: string };
  },
) {
  return {
    id: nfe.id,
    numero: nfe.numero,
    status: nfeStatusToApi(nfe.status),
    createdAt: nfe.createdAt.toISOString(),
    destinatario: {
      cnpj: nfe.customer.cnpj,
      razaoSocial: nfe.customer.razaoSocial,
    },
    chaveAcessoResumo: accessKeyResumo(nfe.accessKey),
  };
}

export function toDashboardStatsView(input: {
  byStatus: Record<NfeStatus, number>;
  byDay: { dia: string; quantidade: number }[];
  total: number;
}) {
  let acumulado = 0;
  const porDiaAcumulado = input.byDay.map((d) => {
    acumulado += d.quantidade;
    return { dia: d.dia, acumulado };
  });
  return {
    total: input.total,
    porStatus: {
      processamento: input.byStatus[NfeStatus.PROCESSING],
      autorizada: input.byStatus[NfeStatus.AUTHORIZED],
      rejeitada: input.byStatus[NfeStatus.REJECTED],
    },
    porDia: input.byDay,
    porDiaAcumulado,
  };
}
