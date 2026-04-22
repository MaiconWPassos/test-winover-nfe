import { FileCode2 } from 'lucide-react';
import { formatNfeDateTime } from '../lib/format-nfe-date';
import type { NfeListItem } from '../types';
import { NfeStatusBadge } from './nfe-status-badge';

type Props = {
	items: NfeListItem[];
	downloadingId: string | null;
	onDownloadXml: (row: NfeListItem) => void;
};

export function NfeListTable({ items, downloadingId, onDownloadXml }: Props) {
	if (items.length === 0) {
		return (
			<p className="px-6 text-sm text-zinc-500">Nenhuma NF-e cadastrada ainda.</p>
		);
	}

	return (
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
							<NfeStatusBadge status={row.status} />
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
						<td className="px-6 py-3 text-zinc-400">{formatNfeDateTime(row.createdAt)}</td>
						<td className="px-6 py-3 text-right">
							{row.status === 'autorizada' ? (
								<button
									type="button"
									onClick={() => onDownloadXml(row)}
									disabled={downloadingId === row.id}
									className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-950/50 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-900/60 disabled:opacity-50"
									title="Baixar XML autorizado"
								>
									<FileCode2 className="size-3.5 shrink-0 opacity-90" aria-hidden />
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
	);
}
