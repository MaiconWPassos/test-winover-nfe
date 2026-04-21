import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
	default:
		'bg-violet-600 text-white shadow hover:bg-violet-500 disabled:opacity-50',
	outline:
		'border border-zinc-600 bg-transparent text-zinc-100 shadow-sm hover:bg-zinc-800 disabled:opacity-50',
	ghost: 'text-zinc-100 hover:bg-zinc-800 disabled:opacity-50',
} as const;

const sizes = {
	default: 'h-9 px-4 text-sm',
	sm: 'h-8 gap-1.5 rounded-md px-3 text-xs',
} as const;

export type ButtonProps = React.ComponentProps<'button'> & {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = 'default', size = 'default', type = 'button', ...props },
		ref,
	) => {
		return (
			<button
				ref={ref}
				type={type}
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
					sizes[size],
					variants[variant],
					className,
				)}
				{...props}
			/>
		);
	},
);
Button.displayName = 'Button';
