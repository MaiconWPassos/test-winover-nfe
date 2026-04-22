import { useMemo, useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { EmitNfeModal } from '@/components/react/EmitNfeModal';
import { useNfeDashboardData } from '@/features/nfe/hooks/use-nfe-dashboard-data';
import { NfeAccumulatedAreaChart } from '@/features/nfe/components/nfe-accumulated-area-chart';
import { NfeStatusBarChart } from '@/features/nfe/components/nfe-status-bar-chart';
import { NfeListTable } from '@/features/nfe/components/nfe-list-table';
import { toStatusBarData } from '@/features/nfe/lib/bar-chart-status-data';

export type { NfeListItem, NfeStats } from '@/features/nfe/types';

export function NfeDashboardSection() {
	const {
		items,
		stats,
		loading,
		error,
		downloadingId,
		loadDashboardData,
		downloadAuthorizedXml,
	} = useNfeDashboardData();
	const [emitOpen, setEmitOpen] = useState(false);

	const barPorStatus = useMemo(() => toStatusBarData(stats), [stats]);

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
				<NfeAccumulatedAreaChart
					data={stats?.porDiaAcumulado ?? []}
					title="Notas emitidas (acumulado)"
					description="Total acumulado por dia (fuso America/Sao_Paulo), últimos 30 dias"
					emptyHint="Sem dados de série ainda — emita NF-e para ver o gráfico."
				/>
				<NfeStatusBarChart
					data={barPorStatus}
					title="Quantidade por status"
					description="Distribuição atual no banco (todas as NF-e)."
				/>
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
					<NfeListTable
						items={items}
						downloadingId={downloadingId}
						onDownloadXml={(row) => void downloadAuthorizedXml(row)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
