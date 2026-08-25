import React from 'react'
import { cn } from '@/lib/utils/formatters'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: 'elevated' | 'filled' | 'outlined'
}

export const Card: React.FC<CardProps> = ({
	children,
	variant = 'outlined',
	className,
	...props
}) => {
	const variants = {
		elevated: 'bg-white rounded-2xl p-5 shadow-md border border-slate-100',
		filled: 'bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60',
		outlined: 'bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-colors shadow-sm',
	}

	return (
		<div className={cn(variants[variant], className)} {...props}>
			{children}
		</div>
	)
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => <div className={cn('flex items-center justify-between pb-3 border-b border-slate-100 mb-4', className)} {...props} />

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
	className,
	...props
}) => <h3 className={cn('text-base font-bold text-slate-800 flex items-center gap-2', className)} {...props} />

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => <div className={cn('', className)} {...props} />
