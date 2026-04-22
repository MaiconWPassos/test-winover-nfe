import type { NfeStats } from '../types';

export type StatusBarDatum = { status: string; quantidade: number };

export function toStatusBarData(stats: NfeStats | null): StatusBarDatum[] {
	if (!stats) return [];
	return [
		{ status: 'Processamento', quantidade: stats.porStatus.processamento },
		{ status: 'Autorizada', quantidade: stats.porStatus.autorizada },
		{ status: 'Rejeitada', quantidade: stats.porStatus.rejeitada },
	];
}
