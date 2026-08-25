import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
	IoGridOutline,
	IoBusinessOutline,
	IoCarSportOutline,
	IoCubeOutline,
	IoConstructOutline,
	IoPricetagsOutline,
	IoDocumentTextOutline,
	IoCardOutline,
	IoStatsChartOutline,
	IoPeopleOutline,
	IoTimeOutline,
	IoChevronDownOutline,
	IoChevronBackOutline,
	IoTrainOutline,
	IoEnterOutline,
	IoArrowForwardOutline,
	IoLayersOutline,
} from 'react-icons/io5'
import { useAuth } from '@/lib/services/auth-context'
import { cn } from '@/lib/utils/formatters'

interface NavItem {
	title: string
	href?: string
	icon: React.ReactNode
	badge?: string
	roles?: string[]
	subItems?: {
		title: string
		href: string
		badge?: string
	}[]
}

const NAV_ITEMS: NavItem[] = [
	{
		title: 'داشبورد مدیریتی',
		href: '/',
		icon: <IoGridOutline className="w-5 h-5" />,
	},
	{
		title: 'شرکت‌ها و مشتریان',
		icon: <IoBusinessOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'لیست شرکت‌ها', href: '/companies' },
			{ title: 'ثبت شرکت جدید', href: '/companies/new' },
			{ title: 'قراردادها و تعرفه‌ها', href: '/companies/contracts' },
		],
	},
	{
		title: 'ناوگان و وسایل نقلیه',
		icon: <IoCarSportOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'خودروهای سنگین و سبک', href: '/fleet/vehicles' },
			{ title: 'واگن‌های باری ریلی', href: '/fleet/wagons' },
		],
	},
	{
		title: 'تردد سایت (ورود/خروج)',
		href: '/site-traffic',
		icon: <IoEnterOutline className="w-5 h-5" />,
		badge: 'لحظه‌ای',
	},
	{
		title: 'کالاها و محصولات',
		icon: <IoCubeOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'کاتالوگ کالاها', href: '/products' },
			{ title: 'انبار ماشین (شماره شاسی‌ها)', href: '/products/vehicles' },
		],
	},
	{
		title: 'انبارداری و موجودی',
		icon: <IoLayersOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'مدیریت انبارها و سالن‌ها', href: '/warehouses' },
			{ title: 'موجودی لحظه‌ای و گردش کالا', href: '/warehouses/inventory' },
			{ title: 'ثبت ورود / خروج به انبار', href: '/warehouses/operations' },
		],
	},
	{
		title: 'عملیات سکو',
		icon: <IoConstructOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'بارگیری و تخلیه', href: '/operations/loading-unloading' },
			{ title: 'ترانشیپمنت (انتقال مستقیم)', href: '/operations/transshipment' },
			{ title: 'خدمات لیفتراک و جرثقیل', href: '/operations/equipment' },
			{ title: 'مانور واگن و خط ریلی', href: '/operations/wagon-maneuver' },
		],
	},
	{
		title: 'خدمات و تعرفه‌گذاری',
		icon: <IoPricetagsOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'کاتالوگ ۲۱ خدمت سامانه', href: '/services' },
			{ title: 'تعرفه‌های پایه و نسخه‌ها', href: '/tariffs' },
			{ title: 'ماشین‌حساب محاسبه هزینه', href: '/tariffs/calculator' },
		],
	},
	{
		title: 'فاکتورهای تجمیعی',
		icon: <IoDocumentTextOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'لیست فاکتورها', href: '/invoices' },
			{ title: 'صدور فاکتور تجمیعی دوره‌ای', href: '/invoices/new' },
		],
	},
	{
		title: 'امور مالی و حساب‌ها',
		icon: <IoCardOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'حساب مشتریان (مانده و بدهی)', href: '/accounting/customer-accounts' },
			{ title: 'ثبت دریافت وجه و پرداخت‌ها', href: '/accounting/payments' },
		],
	},
	{
		title: 'گزارشات تحلیلی',
		icon: <IoStatsChartOutline className="w-5 h-5" />,
		subItems: [
			{ title: 'گزارش مالی و درآمد', href: '/reports/financial' },
			{ title: 'گزارش انبار و کالا', href: '/reports/warehouse' },
			{ title: 'گزارش عملیات سایت', href: '/reports/operations' },
		],
	},
	{
		title: 'کاربران و دسترسی‌ها',
		href: '/users',
		icon: <IoPeopleOutline className="w-5 h-5" />,
		roles: ['super_admin', 'admin'],
	},
	{
		title: 'لاگ و رخدادهای سیستم',
		href: '/audit-logs',
		icon: <IoTimeOutline className="w-5 h-5" />,
		roles: ['super_admin', 'admin', 'manager'],
	},
]

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
	isOpen,
	onClose,
}) => {
	const router = useRouter()
	const { currentUser } = useAuth()
	const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
		'شرکت‌ها و مشتریان': true,
		'انبارداری و موجودی': true,
		'عملیات سکو': true,
	})

	const toggleMenu = (title: string) => {
		setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }))
	}

	const isPathActive = (href?: string, subItems?: { href: string }[]) => {
		if (href && router.pathname === href) return true
		if (subItems && subItems.some((s) => router.pathname === s.href)) return true
		return false
	}

	return (
		<>
			{/* Mobile Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
					onClick={onClose}
				/>
			)}

			<aside
				className={cn(
					'fixed top-0 bottom-0 right-0 z-50 w-72 bg-white border-l border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
					isOpen ? 'translate-x-0' : 'translate-x-full'
				)}
			>
				{/* Brand Header */}
				<div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
							س
						</div>
						<div>
							<h1 className="text-base font-black text-slate-900 tracking-tight">سکوی لجستیک</h1>
							<p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">ManageSako</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
					>
						<IoArrowForwardOutline className="w-5 h-5" />
					</button>
				</div>

				{/* Nav List */}
				<div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm">
					{NAV_ITEMS.map((item) => {
						// RBAC Check
						if (item.roles && !item.roles.includes(currentUser.role)) {
							return null
						}

						const active = isPathActive(item.href, item.subItems)
						const hasSub = item.subItems && item.subItems.length > 0
						const isExpanded = openMenus[item.title]

						if (!hasSub && item.href) {
							return (
								<Link
									key={item.title}
									href={item.href}
									onClick={() => {
										if (window.innerWidth < 1024) onClose()
									}}
									className={cn(
										'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors',
										active
											? 'bg-blue-50 text-blue-700 font-bold'
											: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
									)}
								>
									<div className="flex items-center gap-3">
										<span className={active ? 'text-blue-700' : 'text-slate-400'}>
											{item.icon}
										</span>
										<span>{item.title}</span>
									</div>
									{item.badge && (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
											{item.badge}
										</span>
									)}
								</Link>
							)
						}

						return (
							<div key={item.title} className="space-y-1">
								<button
									onClick={() => toggleMenu(item.title)}
									className={cn(
										'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors',
										active
											? 'text-blue-800 bg-blue-50/50 font-bold'
											: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
									)}
								>
									<div className="flex items-center gap-3">
										<span className={active ? 'text-blue-700' : 'text-slate-400'}>
											{item.icon}
										</span>
										<span>{item.title}</span>
									</div>
									<IoChevronDownOutline
										className={cn(
											'w-4 h-4 text-slate-400 transition-transform duration-200',
											isExpanded ? 'rotate-180 text-blue-700' : ''
										)}
									/>
								</button>

								{isExpanded && hasSub && (
									<div className="pr-8 pl-2 space-y-1 border-r-2 border-slate-100 mr-4">
										{item.subItems!.map((sub) => {
											const isSubActive = router.pathname === sub.href
											return (
												<Link
													key={sub.href}
													href={sub.href}
													onClick={() => {
														if (window.innerWidth < 1024) onClose()
													}}
													className={cn(
														'block px-3 py-2 rounded-lg text-xs font-medium transition-colors',
														isSubActive
															? 'bg-blue-600 text-white font-bold shadow-xs'
															: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
													)}
												>
													{sub.title}
												</Link>
											)
										})}
									</div>
								)}
							</div>
						)
					})}
				</div>

				{/* User Status Card */}
				<div className="p-4 border-t border-slate-100 bg-slate-50/50">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
							{currentUser.fullName.charAt(0)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</p>
							<p className="text-[11px] text-slate-500 truncate">
								{currentUser.role === 'super_admin' && 'سوپر ادمین'}
								{currentUser.role === 'admin' && 'مدیر فنی'}
								{currentUser.role === 'manager' && 'مدیر ناظر'}
								{currentUser.role === 'operator' && 'اپراتور عملیات'}
							</p>
						</div>
					</div>
				</div>
			</aside>
		</>
	)
}
