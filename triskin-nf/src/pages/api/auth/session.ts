import type { APIRoute } from 'astro';
import { SESSION_COOKIE, verifySessionToken } from '@/server/auth-session';

export const GET: APIRoute = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE)?.value;
	const user = await verifySessionToken(token);

	if (!user) {
		return new Response(JSON.stringify({ user: null }), {
			status: 401,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ user }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
