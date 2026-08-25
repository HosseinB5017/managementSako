import React from 'react'
import { cn } from '@/lib/utils/formatters'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline'
	size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
	children,
	variant = 'neutral',
	size = 'sm',
	className,
	...props
}) => {
	const variants = {
		primary: 'bg-blue-100 text-blue-800 border-blue-200',
		success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
		warning: 'bg-amber-100 text-amber-800 border-amber-200',
		error: 'bg-rose-100 text-rose-800 border-rose-200',
		neutral: 'bg-slate-100 text-slate-700 border-slate-200',
		outline: 'bg-transparent text-slate-700 border-slate-300',
	}

	const sizes = {
		sm: 'text-[11px] px-2 py-0.5 font-medium rounded-lg',
		md: 'text-xs px-2.5 py-1 font-semibold rounded-xl',
	}

	return (
		<span
			className={cn(
				'inline-flex items-center justify-center border font-sans select-none whitespace-nowrap gap-1',
				variants[variant],
				sizes[size],
				className
			)}
			{...props}
		>
			{children}
		</span>
	)
}
