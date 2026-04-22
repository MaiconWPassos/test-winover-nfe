import { useCallback, useEffect, useState } from 'react';
import { parseNestApiError } from '@/lib/parse-nest-api-error';
import type { NfeListItem, NfeStats } from '../types';

export function useNfeDashboardData() {
	const [items, setItems] = useState<NfeListItem[]>([]);
	const [stats, setStats] = useState<NfeStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
				throw new Error(
					parseNestApiError(t, 'Não foi possível carregar as NF-e.'),
				);
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

	const downloadAuthorizedXml = useCallback(async (row: NfeListItem) => {
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
				window.alert(parseNestApiError(t, 'Erro ao baixar o XML.'));
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

	return {
		items,
		stats,
		loading,
		error,
		downloadingId,
		loadDashboardData,
		downloadAuthorizedXml,
	};
}
