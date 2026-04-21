import { Injectable } from '@nestjs/common';
import { Nfe } from '../../entities/nfe.entity';
import { NfeItem } from '../../entities/nfe-item.entity';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

@Injectable()
export class NfeXmlBuilder {
  buildNFeLite(nfe: Nfe): string {
    const emit = `<CNPJ>${escapeXml(nfe.emitCnpj)}</CNPJ><IE>${escapeXml(nfe.emitIe)}</IE><UF>${escapeXml(nfe.emitUf)}</UF>`;
    const dest = `<CNPJ>${escapeXml(nfe.customer.cnpj)}</CNPJ><IE>${escapeXml(nfe.customer.ie)}</IE><UF>${escapeXml(nfe.customer.uf)}</UF>`;
    const dets = nfe.items
      .map((it: NfeItem, idx: number) => this.buildDet(it, idx + 1))
      .join('');
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFeLite version="1.0"><emit>${emit}</emit><dest>${dest}</dest>${dets}</NFeLite>`;
  }

  private buildDet(item: NfeItem, nItem: number): string {
    return `<det nItem="${nItem}"><prod><cProd>${escapeXml(item.codigoProduto)}</cProd><xProd>${escapeXml(item.descricao)}</xProd><NCM>${escapeXml(item.ncm)}</NCM><CFOP>${escapeXml(item.cfop)}</CFOP><CST>${escapeXml(item.cst)}</CST><qCom>${escapeXml(String(item.quantidade))}</qCom><vUnCom>${escapeXml(String(item.valorUnitario))}</vUnCom></prod></det>`;
  }

  wrapAuthorizedPayload(
    accessKey: string,
    nfeLiteXml: string,
    protocol: string,
  ): string {
    const inner = nfeLiteXml.replace(/^<\?xml[^>]*>\s*/i, '').trim();
    return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="1.00">
  <NFe>${inner}</NFe>
  <protNFe><infProt><tpAmb>2</tpAmb><chNFe>${escapeXml(accessKey)}</chNFe><nProt>${escapeXml(protocol)}</nProt></infProt></protNFe>
</nfeProc>`;
  }
}
