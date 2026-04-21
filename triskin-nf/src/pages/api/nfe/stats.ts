import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@/server/auth-session';
import { internalApiBase } from '@/server/internal-api-url';

export const GET: APIRoute = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE)?.value;
	if (!token) {
		return new Response(JSON.stringify({ message: 'Não autenticado' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const upstream = await fetch(`${internalApiBase()}/nfe/stats`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json',
		},
	});

	const text = await upstream.text();
	return new Response(text, {
		status: upstream.status,
		headers: {
			'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
		},
	});
};
