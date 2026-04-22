export function formatNfeDateTime(iso: string): string {
	try {
		return new Intl.DateTimeFormat('pt-BR', {
			dateStyle: 'short',
			timeStyle: 'short',
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}
