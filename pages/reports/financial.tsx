import React from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { MOCK_COMPANIES, MOCK_SERVICES } from '@/lib/mock-data/logistics-mock'
import { formatToman, toPersianDigits } from '@/lib/utils/formatters'
import { IoStatsChartOutline, IoCashOutline, IoTrendingUpOutline } from 'react-icons/io5'

export default function FinancialReportPage() {
	return (
		<AppLayout title="گزارشات مالی و تحلیلی">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">گزارشات مالی و درآمد به تفکیک خدمات</h1>
					<p className="text-sm text-slate-500 mt-1">تحلیل درآمدهای حاصل از ترانشیپمنت، انبارداری، تردد ریلی و جاده‌ای</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
				<StatCard
					title="کل فروش و خدمات ماه"
					value="۱،۲۴۷،۴۰۰،۰۰۰"
					unit="تومان"
					icon={<IoCashOutline className="w-6 h-6" />}
					color="emerald"
				/>
				<StatCard
					title="مجموع وصولی‌های نقدی/حواله"
					value="۸۲،۴۰۰،۰۰۰"
					unit="تومان"
					icon={<IoTrendingUpOutline className="w-6 h-6" />}
					color="blue"
				/>
				<StatCard
					title="مانده مطالبات وصول‌نشده"
					value="۱،۱۶۵،۰۰۰،۰۰۰"
					unit="تومان"
					icon={<IoStatsChartOutline className="w-6 h-6" />}
					color="rose"
				/>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>درآمد به تفکیک شرکت‌های برتر</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>نام شرکت</TableHead>
								<TableHead>شناسه ملی</TableHead>
								<TableHead>کل خدمات دریافت‌شده (تومان)</TableHead>
								<TableHead>وضعیت تسویه</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{MOCK_COMPANIES.map((c) => (
								<TableRow key={c.id}>
									<TableCell className="font-bold text-slate-800">{c.name}</TableCell>
									<TableCell className="font-mono text-xs">{toPersianDigits(c.nationalId)}</TableCell>
									<TableCell className="font-semibold text-emerald-700">
										{formatToman(Math.abs(c.totalBalance) + 50000000)}
									</TableCell>
									<TableCell>
										{c.totalBalance > 0 ? (
											<span className="text-rose-600 font-bold text-xs">دارای بدهی معوق</span>
										) : (
											<span className="text-emerald-600 font-bold text-xs">تسویه منظم</span>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</AppLayout>
	)
}
