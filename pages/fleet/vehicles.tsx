import React from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { IranPlateView } from '@/components/ui/iran-plate'
import { MOCK_VEHICLES, MOCK_WAGONS } from '@/lib/mock-data/logistics-mock'
import { toPersianDigits } from '@/lib/utils/formatters'
import { IoCarSportOutline, IoTrainOutline } from 'react-icons/io5'

export default function FleetPage() {
	return (
		<AppLayout title="مدیریت ناوگان خودرویی و واگن‌های ریلی">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">ناوگان حمل‌ونقل جاده‌ای و واگن‌های ریلی</h1>
					<p className="text-sm text-slate-500 mt-1">مدیریت خودروهای سنگین، تریلی، کشنده، سواری و خطوط ریلی واگن‌ها</p>
				</div>
			</div>

			{/* Wagons Section */}
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>
							<IoTrainOutline className="w-5 h-5 text-indigo-700" />
							واگن‌های باری ریلی ({toPersianDigits(MOCK_WAGONS.length)})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>شماره واگن</TableHead>
									<TableHead>نوع واگن</TableHead>
									<TableHead>شرکت متقاضی</TableHead>
									<TableHead>ظرفیت بارگیری</TableHead>
									<TableHead>موقعیت خط ریلی</TableHead>
									<TableHead>تعداد مانور</TableHead>
									<TableHead>وضعیت عملیات</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{MOCK_WAGONS.map((w) => (
									<TableRow key={w.id}>
										<TableCell className="font-mono font-bold text-indigo-800 text-xs">{w.wagonNumber}</TableCell>
										<TableCell>
											{w.type === 'flat' && 'مسطح (Flat)'}
											{w.type === 'bordered' && 'لبه‌دار (Bordered / High-Sided)'}
											{w.type === 'open_top' && 'روباز (Open Top)'}
											{w.type === 'covered' && 'مسقف (Covered)'}
											{w.type === 'tanker' && 'مخزن‌دار (Tanker)'}
											{w.type === 'refrigerated' && 'یخچالی (Refrigerated)'}
										</TableCell>
										<TableCell className="font-semibold text-slate-800">{w.companyName}</TableCell>
										<TableCell>{toPersianDigits(w.capacityTon)} تن</TableCell>
										<TableCell className="text-xs text-slate-600 font-medium">{w.trackNumber || '-'}</TableCell>
										<TableCell>{toPersianDigits(w.maneuverCount)} بار</TableCell>
										<TableCell>
											{w.status === 'loading' && <Badge variant="warning">در حال بارگیری</Badge>}
											{w.status === 'unloading' && <Badge variant="primary">در حال تخلیه</Badge>}
											{w.status === 'overnight' && <Badge variant="error">شب‌خواب ریلی</Badge>}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Vehicles Section */}
				<Card>
					<CardHeader>
						<CardTitle>
							<IoCarSportOutline className="w-5 h-5 text-blue-700" />
							خودروهای تجاری و سواری ({toPersianDigits(MOCK_VEHICLES.length)})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>شماره پلاک</TableHead>
									<TableHead>نوع وسیله</TableHead>
									<TableHead>راننده</TableHead>
									<TableHead>شماره تماس</TableHead>
									<TableHead>شرکت مالک</TableHead>
									<TableHead>ظرفیت (تن)</TableHead>
									<TableHead>حضور در سایت</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{MOCK_VEHICLES.map((v) => (
									<TableRow key={v.id}>
										<TableCell>
											<IranPlateView plate={v.plateNumber} size="sm" />
										</TableCell>
										<TableCell>
											{v.type === 'trailer' && 'تریلی ۱۸ چرخ'}
											{v.type === 'truck' && 'کامیون ده چرخ'}
											{v.type === 'foreign' && 'کامیون ترانزیت خارجی'}
										</TableCell>
										<TableCell className="font-semibold text-slate-800">{v.driverName}</TableCell>
										<TableCell className="font-mono text-xs">{v.driverPhone}</TableCell>
										<TableCell>{v.companyName}</TableCell>
										<TableCell>{toPersianDigits(v.capacityTon)} تن</TableCell>
										<TableCell>
											{v.isInsideSite ? (
												<Badge variant="success">داخل سکو</Badge>
											) : (
												<Badge variant="neutral">خارج از سکو</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	)
}
