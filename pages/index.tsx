import React from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	MOCK_DASHBOARD_STATS,
	MOCK_OPERATIONS,
	MOCK_SITE_VISITS,
	MOCK_WAREHOUSES,
} from '@/lib/mock-data/logistics-mock'
import { formatToman, formatRial, toPersianDigits } from '@/lib/utils/formatters'
import {
	IoCashOutline,
	IoCarSportOutline,
	IoTrainOutline,
	IoCubeOutline,
	IoConstructOutline,
	IoAlertCircleOutline,
	IoArrowBackOutline,
	IoAddOutline,
} from 'react-icons/io5'
import Link from 'next/link'

export default function DashboardPage() {
	const stats = MOCK_DASHBOARD_STATS

	return (
		<AppLayout title="داشبورد مدیریت">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">داشبورد مدیریت سکو</h1>
					<p className="text-sm text-slate-500 mt-1">
						نمای کلی وضعیت عملیات، تردد ناوگان، انبارها و درآمدها
					</p>
				</div>
				<div className="flex items-center gap-2.5">
					<Link href="/site-traffic">
						<Button variant="outlined" size="sm" icon={<IoCarSportOutline className="w-4 h-4" />}>
							ثبت ورود ناوگان
						</Button>
					</Link>
					<Link href="/operations/loading-unloading">
						<Button variant="filled" size="sm" icon={<IoAddOutline className="w-4 h-4" />}>
							ثبت عملیات جدید
						</Button>
					</Link>
				</div>
			</div>

			{/* KPI Stat Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="درآمد امروز سکو"
					value={formatToman(stats.todayRevenueRial)}
					subtitle={`درآمد کل ماه: ${formatToman(stats.monthRevenueRial)}`}
					icon={<IoCashOutline className="w-6 h-6" />}
					color="emerald"
					trend={{ value: 14.5, isPositive: true }}
				/>
				<StatCard
					title="خودروهای داخل سایت"
					value={stats.vehiclesInsideSite}
					unit="دستگاه"
					subtitle="تریلی، کامیون و سواری"
					icon={<IoCarSportOutline className="w-6 h-6" />}
					color="blue"
				/>
				<StatCard
					title="واگن‌های مستقر در خطوط"
					value={stats.wagonsInsideSite}
					unit="واگن"
					subtitle="۲ واگن در حال بارگیری"
					icon={<IoTrainOutline className="w-6 h-6" />}
					color="indigo"
				/>
				<StatCard
					title="موجودی کل انبارها"
					value={stats.totalInventoryTon.toLocaleString('fa-IR')}
					unit="تن"
					subtitle={`تکمیل ظرفیت: ${toPersianDigits(stats.warehouseCapacityPercentage)}%`}
					icon={<IoCubeOutline className="w-6 h-6" />}
					color="amber"
				/>
			</div>

			{/* Middle Row: Active Operations & Warehouse Status */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				{/* Live Operations in Progress (2 Cols) */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<IoConstructOutline className="w-5 h-5 text-blue-600" />
								عملیات در حال اجرای سکو ({toPersianDigits(MOCK_OPERATIONS.length)})
							</CardTitle>
							<Link href="/operations/loading-unloading">
								<Button variant="text" size="sm" icon={<IoArrowBackOutline className="w-3.5 h-3.5" />}>
									مشاهده همه
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>کد عملیات</TableHead>
										<TableHead>نوع خدمت</TableHead>
										<TableHead>مشتری / شرکت</TableHead>
										<TableHead>وسیله / واگن</TableHead>
										<TableHead>تناژ</TableHead>
										<TableHead>هزینه محاسبه‌شده</TableHead>
										<TableHead>وضعیت</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{MOCK_OPERATIONS.map((op) => (
										<TableRow key={op.id}>
											<TableCell className="font-bold text-blue-700">{op.operationCode}</TableCell>
											<TableCell>
												{op.type === 'transshipment' && 'ترانشیپ مستقیم'}
												{op.type === 'loading_crane' && 'بارگیری جرثقیلی'}
												{op.type === 'unloading_forklift' && 'تخلیه لیفتراکی'}
											</TableCell>
											<TableCell className="max-w-[160px] truncate">{op.companyName}</TableCell>
											<TableCell>
												{op.vehiclePlate || op.wagonNumber || '-'}
											</TableCell>
											<TableCell>{toPersianDigits(op.tonnage)} تن</TableCell>
											<TableCell className="font-semibold text-emerald-700">
												{formatRial(op.totalCalculatedCost)}
											</TableCell>
											<TableCell>
												{op.status === 'in_progress' ? (
													<Badge variant="warning">در حال اجرا</Badge>
												) : (
													<Badge variant="success">تکمیل شده</Badge>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Site Visits Traffic Table */}
					<Card>
						<CardHeader>
							<CardTitle>
								<IoCarSportOutline className="w-5 h-5 text-blue-600" />
								تردد لحظه‌ای سایت (ناوگان مستقر)
							</CardTitle>
							<Link href="/site-traffic">
								<Button variant="text" size="sm" icon={<IoArrowBackOutline className="w-3.5 h-3.5" />}>
									مدیریت تردد
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>کد رهگیری</TableHead>
										<TableHead>نوع ناوگان</TableHead>
										<TableHead>پلاک / شماره</TableHead>
										<TableHead>راننده</TableHead>
										<TableHead>زمان ورود</TableHead>
										<TableHead>وضعیت</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{MOCK_SITE_VISITS.filter((v) => v.status === 'inside').map((visit) => (
										<TableRow key={visit.id}>
											<TableCell className="font-bold text-slate-800">{visit.trackingCode}</TableCell>
											<TableCell>
												{visit.targetType === 'vehicle' ? 'خودرو تجاری' : 'واگن باری'}
											</TableCell>
											<TableCell className="font-semibold text-blue-800">
												{visit.vehiclePlate || visit.wagonNumber}
											</TableCell>
											<TableCell>{visit.driverName || 'راننده ریلی'}</TableCell>
											<TableCell>{visit.entryDateTime}</TableCell>
											<TableCell>
												<Badge variant="primary">مستقر در سایت</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Warehouse Capacities & Financial Snapshot (1 Col) */}
				<div className="space-y-6">
					{/* Warehouse Usage Widget */}
					<Card>
						<CardHeader>
							<CardTitle>
								<IoCubeOutline className="w-5 h-5 text-amber-600" />
								وضعیت ظرفیت انبارها
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{MOCK_WAREHOUSES.map((wh) => {
								const percentage = Math.round((wh.usedCapacityTon / wh.totalCapacityTon) * 100)
								return (
									<div key={wh.id} className="space-y-1.5">
										<div className="flex justify-between text-xs font-semibold">
											<span className="text-slate-800">{wh.name}</span>
											<span className="text-slate-600">{toPersianDigits(percentage)}%</span>
										</div>
										{/* Progress Bar */}
										<div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
											<div
												className={`h-full rounded-full transition-all ${
													percentage > 80
														? 'bg-rose-500'
														: percentage > 60
														? 'bg-amber-500'
														: 'bg-blue-600'
												}`}
												style={{ width: `${percentage}%` }}
											/>
										</div>
										<div className="flex justify-between text-[11px] text-slate-400">
											<span>اشغال: {toPersianDigits(wh.usedCapacityTon.toLocaleString('fa-IR'))} تن</span>
											<span>کل: {toPersianDigits(wh.totalCapacityTon.toLocaleString('fa-IR'))} تن</span>
										</div>
									</div>
								)
							})}
							<div className="pt-2">
								<Link href="/warehouses" className="block">
									<Button variant="outlined" size="sm" className="w-full">
										مدیریت سالن‌ها و موقعیت‌ها
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>

					{/* Financial Alert & Unpaid Invoices */}
					<Card className="border-rose-100 bg-rose-50/20">
						<CardHeader>
							<CardTitle className="text-rose-800">
								<IoAlertCircleOutline className="w-5 h-5 text-rose-600" />
								مطالبات و فاکتورهای معوق
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="p-3 bg-white rounded-xl border border-rose-100 space-y-1">
								<p className="text-xs text-slate-500 font-medium">مجموع بدهی جاری مشتریان</p>
								<p className="text-lg font-black text-rose-700">
									{formatToman(stats.totalOutstandingDebtRial)}
								</p>
								<p className="text-[11px] text-slate-400">
									{toPersianDigits(stats.unpaidInvoicesCount)} فاکتور در انتظار پرداخت و تسویه
								</p>
							</div>

							<div className="pt-1">
								<Link href="/invoices" className="block">
									<Button variant="danger" size="sm" className="w-full">
										مشاهده فاکتورها و تسویه حساب
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	)
}
