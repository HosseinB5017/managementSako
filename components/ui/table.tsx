import React from 'react'
import { cn } from '@/lib/utils/formatters'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ className, ...props }) => (
	<div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
		<table className={cn('w-full text-right text-sm text-slate-700', className)} {...props} />
	</div>
)

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
	className,
	...props
}) => <thead className={cn('bg-slate-100/80 text-slate-800 text-xs font-bold border-b border-slate-200', className)} {...props} />

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
	className,
	...props
}) => <tbody className={cn('divide-y divide-slate-100 bg-white', className)} {...props} />

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
	className,
	...props
}) => <tr className={cn('hover:bg-blue-50/40 transition-colors', className)} {...props} />

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
	className,
	...props
}) => <th className={cn('px-4 py-3.5 font-bold tracking-wide whitespace-nowrap', className)} {...props} />

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
	className,
	...props
}) => <td className={cn('px-4 py-3.5 align-middle whitespace-nowrap', className)} {...props} />
