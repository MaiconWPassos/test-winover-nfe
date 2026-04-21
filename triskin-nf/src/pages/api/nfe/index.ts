import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@/server/auth-session';
import { internalApiBase } from '@/server/internal-api-url';

export const GET: APIRoute = async ({ cookies, url }) => {
	const token = cookies.get(SESSION_COOKIE)?.value;
	if (!token) {
		return new Response(JSON.stringify({ message: 'Não autenticado' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const limit = url.searchParams.get('limit');
	const qs = limit ? `?limit=${encodeURIComponent(limit)}` : '';

	const upstream = await fetch(`${internalApiBase()}/nfe${qs}`, {
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

export const POST: APIRoute = async ({ request, cookies }) => {
	const token = cookies.get(SESSION_COOKIE)?.value;
	if (!token) {
		return new Response(JSON.stringify({ message: 'Não autenticado' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ message: 'Corpo JSON inválido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const upstream = await fetch(`${internalApiBase()}/nfe`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const text = await upstream.text();
	return new Response(text, {
		status: upstream.status,
		headers: {
			'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
		},
	});
};
