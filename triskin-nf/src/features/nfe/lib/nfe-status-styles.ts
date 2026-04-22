export function nfeStatusBadgeClass(status: string): string {
	switch (status) {
		case 'autorizada':
			return 'border-emerald-500/40 bg-emerald-950/50 text-emerald-200';
		case 'rejeitada':
			return 'border-rose-500/40 bg-rose-950/50 text-rose-200';
		default:
			return 'border-amber-500/40 bg-amber-950/50 text-amber-200';
	}
}
