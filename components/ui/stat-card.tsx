import React from 'react'
import { Card } from './card'
import { toPersianDigits, cn } from '@/lib/utils/formatters'

export interface StatCardProps {
	title: string
	value: string | number
	unit?: string
	subtitle?: string
	icon: React.ReactNode
	trend?: {
		value: number
		isPositive: boolean
	}
	color?: 'blue' | 'teal' | 'amber' | 'rose' | 'indigo' | 'emerald'
}

export const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	unit,
	subtitle,
	icon,
	trend,
	color = 'blue',
}) => {
	const colorThemes = {
		blue: {
			bgIcon: 'bg-blue-100 text-blue-700',
			border: 'border-blue-100 hover:border-blue-200',
		},
		teal: {
			bgIcon: 'bg-teal-100 text-teal-700',
			border: 'border-teal-100 hover:border-teal-200',
		},
		amber: {
			bgIcon: 'bg-amber-100 text-amber-700',
			border: 'border-amber-100 hover:border-amber-200',
		},
		rose: {
			bgIcon: 'bg-rose-100 text-rose-700',
			border: 'border-rose-100 hover:border-rose-200',
		},
		indigo: {
			bgIcon: 'bg-indigo-100 text-indigo-700',
			border: 'border-indigo-100 hover:border-indigo-200',
		},
		emerald: {
			bgIcon: 'bg-emerald-100 text-emerald-700',
			border: 'border-emerald-100 hover:border-emerald-200',
		},
	}

	const theme = colorThemes[color]

	return (
		<Card className={cn('relative overflow-hidden transition-all duration-200 hover:shadow-md', theme.border)}>
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<p className="text-xs font-semibold text-slate-500">{title}</p>
					<div className="flex items-baseline gap-1.5">
						<span className="text-2xl font-black text-slate-800 tracking-tight">
							{typeof value === 'number' ? toPersianDigits(value.toLocaleString('fa-IR')) : value}
						</span>
						{unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
					</div>
					{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
					{trend && (
						<div className="flex items-center gap-1 text-xs">
							<span
								className={cn(
									'font-bold',
									trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
								)}
							>
								{trend.isPositive ? '↑' : '↓'} {toPersianDigits(trend.value)}%
							</span>
							<span className="text-slate-400">نسبت به ماه قبل</span>
						</div>
					)}
				</div>
				<div className={cn('p-3 rounded-2xl flex items-center justify-center', theme.bgIcon)}>
					{icon}
				</div>
			</div>
		</Card>
	)
}
