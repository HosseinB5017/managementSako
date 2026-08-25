import React, { useEffect } from 'react'
import { IoClose } from 'react-icons/io5'
import { cn } from '@/lib/utils/formatters'

export interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	maxWidth = 'lg',
}) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		if (isOpen) {
			document.body.style.overflow = 'hidden'
			window.addEventListener('keydown', handleKeyDown)
		}
		return () => {
			document.body.style.overflow = 'unset'
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl',
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
			<div
				className={cn(
					'bg-white rounded-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]',
					maxWidthClasses[maxWidth]
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
					<h3 className="text-base font-bold text-slate-800">{title}</h3>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors"
					>
						<IoClose className="w-5 h-5" />
					</button>
				</div>

				{/* Body */}
				<div className="p-6 overflow-y-auto flex-1">{children}</div>
			</div>
		</div>
	)
}
