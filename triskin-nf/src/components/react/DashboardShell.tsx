import { useCallback, useState } from 'react';
import { getApiBase } from '@/lib/api';
import { NfeDashboardSection } from '@/components/react/NfeDashboardSection';
import { useUiStore } from '@/stores/ui-store';

export type DashboardUser = { id: string; email: string };

export function DashboardShell({ user }: { user: DashboardUser }) {
	const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore();
	const [health, setHealth] = useState<string | null>(null);
	const [pingBusy, setPingBusy] = useState(false);

	const logout = useCallback(async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			setSidebarOpen(false);
			window.location.replace('/');
		}
	}, [setSidebarOpen]);

	const pingApi = useCallback(async () => {
		setPingBusy(true);
		setHealth(null);
		try {
			const base = getApiBase();
			const res = await fetch(`${base}/`);
			const j = (await res.json()) as { status?: string; service?: string };
			setHealth(JSON.stringify(j));
		} catch {
			setHealth('Serviço indisponível');
		} finally {
			setPingBusy(false);
		}
	}, []);

	return (
		<div className="min-h-screen bg-zinc-950 text-zinc-100">
			<header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={toggleSidebar}
							className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 lg:hidden"
							aria-expanded={sidebarOpen}
						>
							Menu
						</button>
						<div>
							<h1 className="text-lg font-semibold tracking-tight text-white">
								Painel
							</h1>
							<p className="text-xs text-zinc-500">Triskin NF</p>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<span className="hidden text-sm text-zinc-400 sm:inline">
							{user.email}
						</span>
						<button
							type="button"
							onClick={logout}
							className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
						>
							Sair
						</button>
					</div>
				</div>
			</header>

			<div className="mx-auto flex max-w-6xl gap-0 px-4 py-8 lg:gap-8">
			

				<main className="min-w-0 flex-1 space-y-6">
					<section>
						<h2 className="text-xl font-semibold text-white">
							Bem-vindo de volta
						</h2>
						<p className="mt-1 text-sm text-zinc-400">
							Use o painel para acompanhar a API e as próximas ações de NF-e.
						</p>
					</section>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
							<h3 className="text-sm font-medium text-zinc-200">
								Status da API
							</h3>
							<p className="mt-2 min-h-5 text-xs text-zinc-500">
								{health ?? 'Clique em verificar para testar o endpoint raiz.'}
							</p>
							<button
								type="button"
								onClick={pingApi}
								disabled={pingBusy}
								className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
							>
								{pingBusy ? 'Verificando…' : 'Verificar conexão'}
							</button>
						</div>
						<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
							<h3 className="text-sm font-medium text-zinc-200">Próximos passos</h3>
							<ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-400">
								<li>Emitir NF-e pela API</li>
								<li>Consultar status e XML autorizado</li>
								<li>Documentação em /docs na API</li>
							</ul>
						</div>
					</div>

					<NfeDashboardSection />
				</main>
			</div>
		</div>
	);
}
