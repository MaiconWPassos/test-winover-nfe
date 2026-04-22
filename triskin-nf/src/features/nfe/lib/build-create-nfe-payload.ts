export type ItemFormInput = {
	/** Ignorado na montagem do payload (ex.: chave estável em listas React). */
	key?: string;
	codigoProduto: string;
	quantidade: string;
	valorUnitario: string;
	cfop: string;
	cst: string;
};

export type CreateNfeApiPayload = {
	cnpjDestinatario: string;
	ieDestinatario: string;
	ufDestinatario: string;
	itens: {
		codigoProduto: string;
		quantidade: number;
		valorUnitario: number;
		cfop: string;
		cst: string;
	}[];
};

export type BuildPayloadResult =
	| { ok: true; payload: CreateNfeApiPayload }
	| { ok: false; error: string };

export function buildCreateNfePayload(
	cnpjDestinatario: string,
	ieDestinatario: string,
	ufDestinatario: string,
	itens: ItemFormInput[],
): BuildPayloadResult {
	const uf = ufDestinatario.trim().toUpperCase();
	if (uf.length !== 2) {
		return { ok: false, error: 'UF deve ter 2 letras.' };
	}

	const parsedItens: CreateNfeApiPayload['itens'] = [];
	for (const row of itens) {
		const q = Number(String(row.quantidade).replace(',', '.'));
		const vu = Number(String(row.valorUnitario).replace(',', '.'));
		if (!Number.isFinite(q) || q <= 0) {
			return { ok: false, error: 'Quantidade inválida em um dos itens.' };
		}
		if (!Number.isFinite(vu) || vu <= 0) {
			return { ok: false, error: 'Valor unitário inválido em um dos itens.' };
		}
		if (!/^\d{4}$/.test(row.cfop.trim())) {
			return { ok: false, error: 'CFOP deve ter 4 dígitos em cada item.' };
		}
		if (!/^\d{2,3}$/.test(row.cst.trim())) {
			return { ok: false, error: 'CST deve ter 2 ou 3 dígitos em cada item.' };
		}
		parsedItens.push({
			codigoProduto: row.codigoProduto.trim(),
			quantidade: q,
			valorUnitario: vu,
			cfop: row.cfop.trim(),
			cst: row.cst.trim(),
		});
	}

	return {
		ok: true,
		payload: {
			cnpjDestinatario: cnpjDestinatario.replace(/\D/g, ''),
			ieDestinatario: ieDestinatario.trim(),
			ufDestinatario: uf,
			itens: parsedItens,
		},
	};
}
