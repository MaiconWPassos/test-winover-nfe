import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileCode2, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmitNfeModal } from '@/components/react/EmitNfeModal';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

function formatDataHora(iso: string) {
	try {
		return new Intl.DateTimeFormat('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'short',
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

function parseApiError(text: string): string {
	try {
		const j = JSON.parse(text) as { message?: string | string[] };
		if (Array.isArray(j.message)) return j.message.join(', ');
		if (typeof j.message === 'string') return j.message;
	} catch {
		if (text) return text.slice(0, 200);
	}
	return 'Erro ao baixar o XML.';
}

function statusBadgeClass(status: string) {
	switch (status) {
		case 'autorizada':
			return 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200';
		case 'rejeitada':
			return 'border-rose-500/40 bg-rose-950/50 text-rose-200';
		default:
			return 'border-amber-500/40 bg-amber-950/50 text-amber-200';
	}
}

const chartTick = { fill: '#a1a1aa', fontSize: 11 };

export function NfeDashboardSection() {
	const [items, setItems] = useState<NfeListItem[]>([]);
	const [stats, setStats] = useState<NfeStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);
	const [emitOpen, setEmitOpen] = useState(false);

	const loadDashboardData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const [rList, rStats] = await Promise.all([
				fetch('/api/nfe?limit=100', { credentials: 'include' }),
				fetch('/api/nfe/stats', { credentials: 'include' }),
			]);
			if (rList.status === 401 || rStats.status === 401) {
				window.location.replace('/');
				return;
			}
			if (!rList.ok || !rStats.ok) {
				const t = await rList.text().catch(() => '');
				throw new Error(t || 'Não foi possível carregar as NF-e.');
			}
			const listJson: unknown = await rList.json();
			const statsJson: unknown = await rStats.json();
			setItems(Array.isArray(listJson) ? (listJson as NfeListItem[]) : []);
			setStats(statsJson as NfeStats);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Erro ao carregar.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadDashboardData();
	}, [loadDashboardData]);

	const downloadXml = useCallback(async (row: NfeListItem) => {
		if (row.status !== 'autorizada') return;
		setDownloadingId(row.id);
		try {
			const res = await fetch(`/api/nfe/${row.id}/xml`, {
				credentials: 'include',
			});
			if (res.status === 401) {
				window.location.replace('/');
				return;
			}
			if (!res.ok) {
				const t = await res.text();
				window.alert(parseApiError(t));
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `nfe-${row.numero}.xml`;
			a.rel = 'noopener';
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {
			window.alert('Falha de rede ao baixar o XML.');
		} finally {
			setDownloadingId(null);
		}
	}, []);

	const barPorStatus = useMemo(() => {
		if (!stats) return [];
		return [
			{ status: 'Processamento', quantidade: stats.porStatus.processamento },
			{ status: 'Autorizada', quantidade: stats.porStatus.autorizada },
			{ status: 'Rejeitada', quantidade: stats.porStatus.rejeitada },
		];
	}, [stats]);

	if (loading) {
		return (
			<p className="text-sm text-zinc-500">Carregando notas e indicadores…</p>
		);
	}

	if (error) {
		return (
			<p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
				{error}
			</p>
		);
	}

	return (
		<div className="space-y-8">
			<EmitNfeModal
				open={emitOpen}
				onOpenChange={setEmitOpen}
				onSuccess={() => void loadDashboardData()}
			/>
			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="text-base text-zinc-100">
							Notas emitidas (acumulado)
						</CardTitle>
						<CardDescription>
							Total acumulado por dia (fuso America/Sao_Paulo), últimos 30 dias
						</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] pt-2">
						{stats && stats.porDiaAcumulado.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={stats.porDiaAcumulado}
									margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
								>
									<defs>
										<linearGradient id="fillAcum" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
											<stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-zinc-800"
										vertical={false}
									/>
									<XAxis
										dataKey="dia"
										tick={chartTick}
										tickLine={false}
										axisLine={false}
									/>
									<YAxis tick={chartTick} tickLine={false} axisLine={false} width={36} />
									<Tooltip
										contentStyle={{
											backgroundColor: '#18181b',
											border: '1px solid #3f3f46',
											borderRadius: '8px',
											fontSize: '12px',
										}}
										labelStyle={{ color: '#e4e4e7' }}
									/>
									<Area
										type="monotone"
										dataKey="acumulado"
										stroke="#a78bfa"
										strokeWidth={2}
										fill="url(#fillAcum)"
										name="Total acumulado"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<p className="text-sm text-zinc-500">
								Sem dados de série ainda — emita NF-e para ver o gráfico.
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base text-zinc-100">
							Quantidade por status
						</CardTitle>
						<CardDescription>
							Distribuição atual no banco (todas as NF-e).
						</CardDescription>
					</CardHeader>
					<CardContent className="h-[300px] pt-2">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={barPorStatus} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
								<CartesianGrid
									strokeDasharray="3 3"
									className="stroke-zinc-800"
									vertical={false}
								/>
								<XAxis
									dataKey="status"
									tick={chartTick}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									allowDecimals={false}
									tick={chartTick}
									tickLine={false}
									axisLine={false}
									width={36}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: '#18181b',
										border: '1px solid #3f3f46',
										borderRadius: '8px',
										fontSize: '12px',
									}}
									labelStyle={{ color: '#e4e4e7' }}
								/>
								<Bar
									dataKey="quantidade"
									radius={[6, 6, 0, 0]}
									fill="#8b5cf6"
									name="Quantidade"
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1.5">
						<CardTitle className="text-base text-zinc-100">Notas emitidas</CardTitle>
						<CardDescription>
							{stats ? (
								<>
									{stats.total} registro(s) no sistema — exibindo até {items.length}{' '}
									mais recentes.
								</>
							) : (
								'Lista resumida retornada pela API.'
							)}
						</CardDescription>
					</div>
					<Button
						type="button"
						size="sm"
						className="shrink-0 gap-1.5"
						onClick={() => setEmitOpen(true)}
					>
						<FilePlus2 className="size-4" aria-hidden />
						Nova NF-e
					</Button>
				</CardHeader>
				<CardContent className="overflow-x-auto px-0 sm:px-6">
					{items.length === 0 ? (
						<p className="px-6 text-sm text-zinc-500">
							Nenhuma NF-e cadastrada ainda.
						</p>
					) : (
						<table className="w-full min-w-[720px] text-left text-sm">
							<thead>
								<tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
									<th className="px-6 py-3 font-medium">Nº</th>
									<th className="px-4 py-3 font-medium">Status</th>
									<th className="px-4 py-3 font-medium">Destinatário</th>
									<th className="px-4 py-3 font-medium">Chave</th>
									<th className="px-6 py-3 font-medium">Criada em</th>
									<th className="px-6 py-3 font-medium text-right">XML</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-800">
								{items.map((row) => (
									<tr key={row.id} className="text-zinc-300 hover:bg-zinc-900/50">
										<td className="px-6 py-3 font-mono text-zinc-100">{row.numero}</td>
										<td className="px-4 py-3">
											<span
												className={cn(
													'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
													statusBadgeClass(row.status),
												)}
											>
												{row.status}
											</span>
										</td>
										<td className="max-w-[220px] px-4 py-3">
											<span className="block max-w-[200px] truncate" title={row.destinatario.razaoSocial}>
												{row.destinatario.razaoSocial}
											</span>
											<span className="mt-0.5 block font-mono text-xs text-zinc-500">
												{row.destinatario.cnpj}
											</span>
										</td>
										<td className="px-4 py-3 font-mono text-xs text-zinc-500">
											{row.chaveAcessoResumo ?? '—'}
										</td>
										<td className="px-6 py-3 text-zinc-400">
											{formatDataHora(row.createdAt)}
										</td>
										<td className="px-6 py-3 text-right">
											{row.status === 'autorizada' ? (
												<button
													type="button"
													onClick={() => void downloadXml(row)}
													disabled={downloadingId === row.id}
													className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-950/50 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-900/60 disabled:opacity-50"
													title="Baixar XML autorizado"
												>
													<FileCode2
														className="size-3.5 shrink-0 opacity-90"
														aria-hidden
													/>
													{downloadingId === row.id ? 'Baixando…' : 'Baixar XML'}
												</button>
											) : (
												<span className="text-xs text-zinc-600" title="Só disponível para NF-e autorizada">
													—
												</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
