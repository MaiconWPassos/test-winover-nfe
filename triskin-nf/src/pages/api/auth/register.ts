import type { APIRoute } from 'astro';
import {
	SESSION_COOKIE,
	sessionCookieOptions,
} from '@/server/auth-session';
import { internalApiBase } from '@/server/internal-api-url';

export const POST: APIRoute = async ({ request, cookies }) => {
	let body: { email?: string; password?: string };
	try {
		body = (await request.json()) as { email?: string; password?: string };
	} catch {
		return new Response(JSON.stringify({ message: 'Corpo JSON inválido' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const email = typeof body.email === 'string' ? body.email.trim() : '';
	const password = typeof body.password === 'string' ? body.password : '';

	if (!email || !password) {
		return new Response(
			JSON.stringify({ message: 'E-mail e senha são obrigatórios' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	if (password.length < 8) {
		return new Response(
			JSON.stringify({ message: 'Senha deve ter no mínimo 8 caracteres' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	const upstream = await fetch(`${internalApiBase()}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	});

	const text = await upstream.text();
	if (!upstream.ok) {
		return new Response(text || JSON.stringify({ message: 'Falha no cadastro' }), {
			status: upstream.status,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	let data: { access_token?: string };
	try {
		data = JSON.parse(text) as { access_token?: string };
	} catch {
		return new Response(JSON.stringify({ message: 'Resposta inválida da API' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	if (!data.access_token) {
		return new Response(JSON.stringify({ message: 'Token ausente na resposta' }), {
			status: 502,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	cookies.set(SESSION_COOKIE, data.access_token, sessionCookieOptions());

	return new Response(JSON.stringify({ ok: true }), {
		status: 201,
		headers: { 'Content-Type': 'application/json' },
	});
};
