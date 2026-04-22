import { useCallback, useState, type FormEvent } from 'react';
import { parseNestApiError } from '@/lib/parse-nest-api-error';

type Tab = 'login' | 'register';

export function LoginPage() {
	const [tab, setTab] = useState<Tab>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onLogin = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			setError(null);
			setBusy(true);
			try {
				const res = await fetch('/api/auth/login', {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: email.trim(),
						password,
					}),
				});
				const text = await res.text();
				if (!res.ok) {
					throw new Error(parseNestApiError(text, 'Algo deu errado. Tente novamente.'));
				}
				window.location.assign('/dashboard');
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Não foi possível entrar.',
				);
			} finally {
				setBusy(false);
			}
		},
		[email, password],
	);

	const onRegister = useCallback(
		async (e: FormEvent) => {
			e.preventDefault();
			setError(null);
			if (password.length < 8) {
				setError('A senha deve ter no mínimo 8 caracteres.');
				return;
			}
			if (password !== confirmPassword) {
				setError('As senhas não coincidem.');
				return;
			}
			setBusy(true);
			try {
				const res = await fetch('/api/auth/register', {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email: email.trim(),
						password,
					}),
				});
				const text = await res.text();
				if (!res.ok) {
					throw new Error(parseNestApiError(text, 'Algo deu errado. Tente novamente.'));
				}
				window.location.assign('/dashboard');
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Não foi possível cadastrar.',
				);
			} finally {
				setBusy(false);
			}
		},
		[email, password, confirmPassword],
	);

	const switchTab = (next: Tab) => {
		setTab(next);
		setError(null);
		setConfirmPassword('');
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
			<div
				className="pointer-events-none absolute inset-0 opacity-40"
				aria-hidden
			>
				<div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
				<div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />
			</div>

			<div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
				<div className="mb-10 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
						Triskin
					</p>
					<h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
						Triskin NF
					</h1>
					<p className="mt-2 text-sm text-zinc-400">
						{tab === 'login'
							? 'Acesse sua conta para gerenciar notas fiscais.'
							: 'Crie sua conta para começar.'}
					</p>
				</div>

				<div className="mb-6 flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
					<button
						type="button"
						onClick={() => switchTab('login')}
						className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
							tab === 'login'
								? 'bg-violet-600 text-white shadow-md'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						Entrar
					</button>
					<button
						type="button"
						onClick={() => switchTab('register')}
						className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
							tab === 'register'
								? 'bg-violet-600 text-white shadow-md'
								: 'text-zinc-400 hover:text-zinc-200'
						}`}
					>
						Cadastrar
					</button>
				</div>

				{tab === 'login' ? (
					<form
						onSubmit={onLogin}
						className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl shadow-violet-950/30 backdrop-blur-md"
					>
						<div className="space-y-5">
							<label className="block">
								<span className="text-sm font-medium text-zinc-300">
									E-mail
								</span>
								<input
									type="email"
									name="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-violet-500/40 transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2"
									placeholder="seu@email.com"
								/>
							</label>
							<label className="block">
								<span className="text-sm font-medium text-zinc-300">
									Senha
								</span>
								<input
									type="password"
									name="password"
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-violet-500/40 transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2"
									placeholder="••••••••"
								/>
							</label>
						</div>

						{error ? (
							<p
								className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
								role="alert"
							>
								{error}
							</p>
						) : null}

						<button
							type="submit"
							disabled={busy}
							className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{busy ? 'Entrando…' : 'Entrar'}
						</button>
					</form>
				) : (
					<form
						onSubmit={onRegister}
						className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl shadow-violet-950/30 backdrop-blur-md"
					>
						<div className="space-y-5">
							<label className="block">
								<span className="text-sm font-medium text-zinc-300">
									E-mail
								</span>
								<input
									type="email"
									name="email"
									autoComplete="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-violet-500/40 transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2"
									placeholder="seu@email.com"
								/>
							</label>
							<label className="block">
								<span className="text-sm font-medium text-zinc-300">
									Senha
								</span>
								<input
									type="password"
									name="password"
									autoComplete="new-password"
									required
									minLength={8}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-violet-500/40 transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2"
									placeholder="Mínimo 8 caracteres"
								/>
							</label>
							<label className="block">
								<span className="text-sm font-medium text-zinc-300">
									Confirmar senha
								</span>
								<input
									type="password"
									name="confirmPassword"
									autoComplete="new-password"
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-violet-500/40 transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2"
									placeholder="Repita a senha"
								/>
							</label>
						</div>

						{error ? (
							<p
								className="mt-4 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
								role="alert"
							>
								{error}
							</p>
						) : null}

						<button
							type="submit"
							disabled={busy}
							className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{busy ? 'Criando conta…' : 'Criar conta'}
						</button>
					</form>
				)}

				
			</div>
		</div>
	);
}
