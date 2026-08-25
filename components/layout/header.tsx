import React, { useState } from 'react'
import {
	IoMenuOutline,
	IoNotificationsOutline,
	IoCalendarOutline,
	IoPersonCircleOutline,
	IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { useAuth } from '@/lib/services/auth-context'
import { getPersianTodayDate, toPersianDigits } from '@/lib/utils/formatters'
import { UserRole } from '@/lib/types/logistics'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data/logistics-mock'
import Link from 'next/link'

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
	const { currentUser, setCurrentRole } = useAuth()
	const [showRoleMenu, setShowRoleMenu] = useState(false)
	const [showNotifMenu, setShowNotifMenu] = useState(false)
	const todayDate = getPersianTodayDate()
	const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length

	return (
		<header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
			{/* Left / Right Start: Menu Button & Title */}
			<div className="flex items-center gap-3">
				<button
					onClick={onMenuToggle}
					className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
				>
					<IoMenuOutline className="w-6 h-6" />
				</button>

				{/* Live Date Badge */}
				<div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
					<IoCalendarOutline className="w-4 h-4 text-blue-600" />
					<span>امروز: {toPersianDigits(todayDate)}</span>
				</div>
			</div>

			{/* Center / Actions: Role Switcher, Notifications, Profile */}
			<div className="flex items-center gap-3">
				{/* Demo Role Switcher */}
				<div className="relative">
					<button
						onClick={() => setShowRoleMenu(!showRoleMenu)}
						className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all border border-blue-200"
					>
						<IoShieldCheckmarkOutline className="w-4 h-4 text-blue-700" />
						<span className="hidden md:inline">تغییر نقش (دمو):</span>
						<span>
							{currentUser.role === 'super_admin' && 'سوپر ادمین'}
							{currentUser.role === 'admin' && 'مدیر فنی'}
							{currentUser.role === 'manager' && 'مدیر ناظر'}
							{currentUser.role === 'operator' && 'اپراتور'}
						</span>
					</button>

					{showRoleMenu && (
						<div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
							<div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100">
								انتخاب نقش کاربری
							</div>
							{(['super_admin', 'admin', 'manager', 'operator'] as UserRole[]).map((role) => (
								<button
									key={role}
									onClick={() => {
										setCurrentRole(role)
										setShowRoleMenu(false)
									}}
									className="w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
								>
									{role === 'super_admin' && 'سوپر ادمین (دسترسی کل)'}
									{role === 'admin' && 'مدیر فنی (تعرفه و انبار)'}
									{role === 'manager' && 'مدیر ناظر (گزارش و مالی)'}
									{role === 'operator' && 'اپراتور (ثبت عملیات)'}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Notifications Dropdown */}
				<div className="relative">
					<button
						onClick={() => setShowNotifMenu(!showNotifMenu)}
						className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
					>
						<IoNotificationsOutline className="w-5 h-5" />
						{unreadCount > 0 && (
							<span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
						)}
					</button>

					{showNotifMenu && (
						<div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50">
							<div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
								<h4 className="text-xs font-bold text-slate-800">اعلان‌های سامانه</h4>
								<span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
									{toPersianDigits(unreadCount)} جدید
								</span>
							</div>
							<div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
								{MOCK_NOTIFICATIONS.map((n) => (
									<div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
										<p className="text-xs font-bold text-slate-800 mb-1">{n.title}</p>
										<p className="text-[11px] text-slate-600 leading-relaxed mb-1">{n.message}</p>
										<span className="text-[10px] text-slate-400">{n.createdAt}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* User Profile Avatar */}
				<div className="flex items-center gap-2 pl-2 border-r border-slate-200 pr-2">
					<div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
						<IoPersonCircleOutline className="w-6 h-6 text-slate-600" />
					</div>
				</div>
			</div>
		</header>
	)
}
