import { defineMiddleware } from 'astro:middleware';
import {
	SESSION_COOKIE,
	verifySessionToken,
} from './server/auth-session';

function isPublicAsset(pathname: string): boolean {
	return /\.(ico|svg|png|jpg|jpeg|webp|gif|woff2?|txt|xml|webmanifest)$/i.test(
		pathname,
	);
}

export const onRequest = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	if (
		pathname.startsWith('/api/') ||
		pathname.startsWith('/_astro/') ||
		isPublicAsset(pathname)
	) {
		return next();
	}

	const token = context.cookies.get(SESSION_COOKIE)?.value;
	let user = await verifySessionToken(token);

	if (token && !user) {
		context.cookies.delete(SESSION_COOKIE, { path: '/' });
	}

	const isDashboard =
		pathname === '/dashboard' || pathname.startsWith('/dashboard/');

	if (isDashboard) {
		if (!user) {
			return Response.redirect(new URL('/', context.url), 302);
		}
		context.locals.user = user;
		return next();
	}

	const isHome = pathname === '/' || pathname === '';

	if (isHome && user) {
		return Response.redirect(new URL('/dashboard', context.url), 302);
	}

	return next();
});
