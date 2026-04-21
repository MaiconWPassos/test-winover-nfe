import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@/server/auth-session';
import { internalApiBase } from '@/server/internal-api-url';

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const GET: APIRoute = async ({ params, cookies }) => {
	const raw = params.id;
	const id = Array.isArray(raw) ? raw[0] : raw;
	if (!id || !UUID_RE.test(id)) {
		return new Response(JSON.stringify({ message: 'ID da NF-e inválido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const token = cookies.get(SESSION_COOKIE)?.value;
	if (!token) {
		return new Response(JSON.stringify({ message: 'Não autenticado' }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const upstream = await fetch(`${internalApiBase()}/nfe/${id}/xml`, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/xml',
		},
	});

	const body = await upstream.text();
	if (!upstream.ok) {
		return new Response(body, {
			status: upstream.status,
			headers: {
				'Content-Type':
					upstream.headers.get('content-type') ?? 'application/json',
			},
		});
	}

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Content-Disposition': `attachment; filename="nfe-${id}.xml"`,
		},
	});
};
