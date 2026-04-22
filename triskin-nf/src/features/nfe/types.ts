export type NfeListItem = {
	id: string;
	numero: number;
	status: string;
	createdAt: string;
	destinatario: { cnpj: string; razaoSocial: string };
	chaveAcessoResumo: string | null;
};

export type NfeStats = {
	total: number;
	porStatus: {
		processamento: number;
		autorizada: number;
		rejeitada: number;
	};
	porDia: { dia: string; quantidade: number }[];
	porDiaAcumulado: { dia: string; acumulado: number }[];
};
