import { cn } from '@/lib/utils';
import { nfeStatusBadgeClass } from '../lib/nfe-status-styles';

export function NfeStatusBadge({ status }: { status: string }) {
	return (
		<span
			className={cn(
				'inline-flex rounded-md border px-2 py-0.5 text-xs font-medium',
				nfeStatusBadgeClass(status),
			)}
		>
			{status}
		</span>
	);
}
