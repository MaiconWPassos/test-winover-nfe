/** Base da API Nest (ex.: http://localhost:3000) */
export function getApiBase(): string {
	const base = import.meta.env.PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
	if (!base && import.meta.env.DEV) {
		return 'http://localhost:3000';
	}
	return base;
}

export async function apiFetch<T>(
	path: string,
	init?: RequestInit & { json?: unknown },
): Promise<T> {
	const { json, headers, ...rest } = init ?? {};
	const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
	const res = await fetch(url, {
		...rest,
		headers: {
			...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
			...headers,
		},
		body: json !== undefined ? JSON.stringify(json) : rest.body,
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	const ct = res.headers.get('content-type');
	if (ct?.includes('application/json')) {
		return (await res.json()) as T;
	}
	return (await res.text()) as T;
}
