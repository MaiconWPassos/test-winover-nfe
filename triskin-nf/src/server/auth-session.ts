import { jwtVerify } from 'jose';

/** Cookie HttpOnly — mesmo JWT emitido pela API Nest (HS256, mesmo JWT_SECRET). */
export const SESSION_COOKIE = 'triskin_session';

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function getJwtSecretKey(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret || secret.length < 8) {
		throw new Error('JWT_SECRET ausente ou curto demais');
	}
	return new TextEncoder().encode(secret);
}

export async function verifySessionToken(
	token: string | undefined,
): Promise<{ id: string; email: string } | null> {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, getJwtSecretKey(), {
			algorithms: ['HS256'],
		});
		const sub = typeof payload.sub === 'string' ? payload.sub : undefined;
		const email = typeof payload.email === 'string' ? payload.email : undefined;
		if (!sub || !email) return null;
		return { id: sub, email };
	} catch {
		return null;
	}
}

export function sessionCookieOptions(): {
	path: string;
	httpOnly: boolean;
	sameSite: 'lax';
	secure: boolean;
	maxAge: number;
} {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		maxAge: COOKIE_MAX_AGE_SEC,
	};
}
