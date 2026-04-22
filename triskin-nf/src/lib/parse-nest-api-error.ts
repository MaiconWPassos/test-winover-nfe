/**
 * Corpo de erro típico do NestJS (`{ message: string | string[] }`).
 * Usado no browser após `res.text()` quando a API não retorna JSON estruturado de outro tipo.
 */
export function parseNestApiError(
	text: string,
	fallback = 'Não foi possível concluir a operação.',
): string {
	try {
		const j = JSON.parse(text) as { message?: string | string[] };
		if (Array.isArray(j.message)) return j.message.join(', ');
		if (typeof j.message === 'string') return j.message;
	} catch {
		if (text) return text.slice(0, 280);
	}
	return fallback;
}
