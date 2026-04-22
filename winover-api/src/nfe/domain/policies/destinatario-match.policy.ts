import { BadRequestException } from '@nestjs/common';

export function onlyDigitsCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

/** Dados mínimos do cliente ERP para conferência com o DTO de emissão. */
export type ErpClienteDestinatario = {
  cnpj: string;
  ie: string;
  uf: string;
};

export function assertDestinatarioMatchesErpCliente(
  dto: {
    cnpjDestinatario: string;
    ieDestinatario: string;
    ufDestinatario: string;
  },
  customer: ErpClienteDestinatario,
): void {
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
}
