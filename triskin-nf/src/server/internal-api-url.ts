/** Base URL da API Nest só no servidor (Docker: API_INTERNAL_URL). */
export function internalApiBase(): string {
	const proc = (
		globalThis as typeof globalThis & {
			process?: { env?: Record<string, string | undefined> };
		}
	).process;
	const base = proc?.env?.API_INTERNAL_URL ?? 'http://localhost:3000';
	return base.replace(/\/$/, '');
}
