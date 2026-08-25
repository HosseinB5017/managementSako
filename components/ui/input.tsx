import React from 'react'
import { cn } from '@/lib/utils/formatters'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	helperText?: string
	icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
	label,
	error,
	helperText,
	icon,
	className,
	id,
	...props
}) => {
	const inputId = id || label ? `input-${label?.replace(/\s+/g, '-')}` : undefined

	return (
		<div className="w-full flex flex-col gap-1.5">
			{label && (
				<label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
					{label}
					{props.required && <span className="text-red-500 mr-1">*</span>}
				</label>
			)}
			<div className="relative flex items-center">
				{icon && <div className="absolute right-3 text-slate-400 pointer-events-none">{icon}</div>}
				<input
					id={inputId}
					className={cn(
						'w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400',
						icon ? 'pr-10' : '',
						error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : '',
						className
					)}
					{...props}
				/>
			</div>
			{error && <span className="text-xs text-red-600 font-medium">{error}</span>}
			{helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
		</div>
	)
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	error?: string
	options: { value: string | number; label: string }[]
}

export const Select: React.FC<SelectProps> = ({
	label,
	error,
	options,
	className,
	id,
	...props
}) => {
	const selectId = id || label ? `select-${label?.replace(/\s+/g, '-')}` : undefined

	return (
		<div className="w-full flex flex-col gap-1.5">
			{label && (
				<label htmlFor={selectId} className="text-xs font-semibold text-slate-700">
					{label}
					{props.required && <span className="text-red-500 mr-1">*</span>}
				</label>
			)}
			<select
				id={selectId}
				className={cn(
					'w-full bg-white border border-slate-300 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100',
					error ? 'border-red-500' : '',
					className
				)}
				{...props}
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			{error && <span className="text-xs text-red-600 font-medium">{error}</span>}
		</div>
	)
}
