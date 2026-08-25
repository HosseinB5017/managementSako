import React from 'react'
import { cn } from '@/lib/utils/formatters'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'danger'
	size?: 'sm' | 'md' | 'lg'
	icon?: React.ReactNode
	loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
	children,
	variant = 'filled',
	size = 'md',
	icon,
	loading = false,
	className,
	disabled,
	...props
}) => {
	const baseClasses =
		'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none'

	const sizeClasses = {
		sm: 'text-xs px-3 py-1.5 gap-1.5',
		md: 'text-sm px-4 py-2.5 gap-2',
		lg: 'text-base px-6 py-3.5 gap-2.5',
	}

	const variantClasses = {
		filled: 'bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm hover:shadow',
		elevated: 'bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 shadow-md hover:shadow-lg border border-slate-100',
		tonal: 'bg-blue-50 text-blue-800 hover:bg-blue-100 active:bg-blue-200',
		outlined: 'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
		text: 'text-blue-700 hover:bg-blue-50 active:bg-blue-100',
		danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
	}

	return (
		<button
			className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-1" />
			) : (
				icon && <span className="flex items-center justify-center">{icon}</span>
			)}
			{children}
		</button>
	)
}
