import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { IranPlateView } from '@/components/ui/iran-plate'
import { MOCK_SITE_VISITS, MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { SiteVisit } from '@/lib/types/logistics'
import { formatToman, toPersianDigits, getPersianTodayDate, cn } from '@/lib/utils/formatters'
import {
	IoExitOutline,
	IoCarSportOutline,
	IoTrainOutline,
	IoAddOutline,
	IoSearchOutline,
	IoEyeOutline,
	IoRefreshOutline,
	IoFilterOutline,
	IoTimeOutline,
	IoCardOutline,
	IoAlertCircleOutline,
	IoBusinessOutline,
	IoDocumentTextOutline,
	IoChevronDownOutline,
	IoChevronUpOutline,
	IoCheckmarkCircleOutline,
} from 'react-icons/io5'

const STORAGE_KEY_VISITS = 'managesako-site-visits'

type TrafficTabStatus = 'inside' | 'pending_op' | 'pending_settlement' | 'exited' | 'cancelled' | 'all'
type FinancialFilterStatus = 'all' | 'settled' | 'pending' | 'credit'
type TransportTypeFilter = 'all' | 'vehicle' | 'wagon'
type SortOption = 'newest' | 'oldest' | 'tracking_code' | 'company'

export default function SiteTrafficPage() {
	const router = useRouter()
	const [visits, setVisits] = useState<SiteVisit[]>([
		{
			id: 'vis_car_trans_1',
			trackingCode: 'RG-1405-00128',
			targetType: 'vehicle',
			vehiclePlate: '99-A-741 TR (ترکیه)',
			driverName: 'محمت اصلان',
			driverPhone: '+905321234567',
			companyId: 'comp_3',
			companyName: 'بازرگانی خودرو پارس سپهر',
			cargoType: 'vehicles',
			vehicleManifest: [
				{
					id: 'm_1',
					chassisNumber: 'JTMHU01J8N4109882',
					brandAndModel: 'تویوتا لندکروزر GR Sport',
					modelYear: 2024,
					color: 'سفید صدفی متالیک',
					valueUsd: 85000,
					companyId: 'comp_3',
					companyName: 'بازرگانی خودرو پارس سپهر',
					entryDate: '1405/06/04',
					status: 'in_stock',
				},
				{
					id: 'm_2',
					chassisNumber: 'JTMHU01J8N4109883',
					brandAndModel: 'تویوتا لندکروزر GR Sport',
					modelYear: 2024,
					color: 'مشکی متالیک',
					valueUsd: 85000,
					companyId: 'comp_3',
					companyName: 'بازرگانی خودرو پارس سپهر',
					entryDate: '1405/06/04',
					status: 'in_stock',
				},
				{
					id: 'm_3',
					chassisNumber: 'KM8RNDHF3PU712390',
					brandAndModel: 'هیوندای سانتافه Calligraphy',
					modelYear: 2025,
					color: 'مشکی متالیک',
					valueUsd: 48000,
					companyId: 'comp_3',
					companyName: 'بازرگانی خودرو پارس سپهر',
					entryDate: '1405/06/04',
					status: 'in_stock',
				},
			],
			entryDateTime: '1405/06/04 ۰۸:۳۰',
			operationType: 'unloading',
			parkingLocation: 'پارکینگ خودروهای وارداتی',
			entranceFeeCalculated: 8000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'تریلی خودروبر حامل ۳ دستگاه خودروی سواری صفر',
		},
		{
			id: 'vis_wgn_1',
			trackingCode: 'RG-1405-00129',
			targetType: 'wagon',
			wagonNumber: 'WGN-880412',
			companyId: 'comp_2',
			companyName: 'مجتمع فولاد البرز کاسپین',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۰۹:۱۵',
			operationType: 'loading',
			parkingLocation: 'خط ۴ ریلی - سکوی الف',
			entranceFeeCalculated: 35000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'واگن مسطح بارگیری شمش فولادی ۵SP',
		},
		{
			id: 'vis_truck_2',
			trackingCode: 'RG-1405-00130',
			targetType: 'vehicle',
			vehiclePlate: '۱۲ ع ۳۴۵ ایران ۲۲',
			driverName: 'مرتضی اکبری',
			driverPhone: '09129871122',
			companyId: 'comp_1',
			companyName: 'شرکت لجستیک و ترانزیت خاورمیانه',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۰۹:۴۰',
			operationType: 'transshipment',
			parkingLocation: 'سکوی تخلیه و بارگیری شماره ۱',
			entranceFeeCalculated: 4000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'ترانشیپمنت غلات از کامیون به واگن مسقف',
		},
		{
			id: 'vis_truck_3',
			trackingCode: 'RG-1405-00131',
			targetType: 'vehicle',
			vehiclePlate: '۷۸ ج ۸۹۱ ایران ۱۱',
			driverName: 'سهراب گودرزی',
			driverPhone: '09193334455',
			companyId: 'comp_1',
			companyName: 'شرکت لجستیک و ترانزیت خاورمیانه',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۱۰:۰۰',
			operationType: 'storage',
			parkingLocation: 'انبار مرکزی سرپوشیده شماره ۱',
			entranceFeeCalculated: 4000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'تخلیه پالت‌های مواد غذایی در سالن انبار',
		},
		{
			id: 'vis_wgn_4',
			trackingCode: 'RG-1405-00132',
			targetType: 'wagon',
			wagonNumber: 'WGN-774512',
			companyId: 'comp_4',
			companyName: 'صنایع پتروشیمی زاگرس آریا',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۱۰:۳۰',
			operationType: 'unloading',
			parkingLocation: 'خط ۵ توقف و مخازن',
			entranceFeeCalculated: 35000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'واگن مخزن‌دار حامل متانول مایع (خطرناک ADR)',
		},
		{
			id: 'vis_truck_5',
			trackingCode: 'RG-1405-00133',
			targetType: 'vehicle',
			vehiclePlate: '۲۴ ع ۹۶۲ ایران ۴۴',
			driverName: 'داریوش کاظمی',
			driverPhone: '09132223344',
			companyId: 'comp_2',
			companyName: 'مجتمع فولاد البرز کاسپین',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۱۱:۰۰',
			operationType: 'loading',
			parkingLocation: 'محوطه باز دپوی فلزات و کانتینر',
			entranceFeeCalculated: 5000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'تریلی کفی بارگیری لوله‌های صنعتی',
		},
		{
			id: 'vis_truck_6',
			trackingCode: 'RG-1405-00134',
			targetType: 'vehicle',
			vehiclePlate: '۵۵ ب ۷۲۱ ایران ۶۸',
			driverName: 'بهنام رستمی',
			driverPhone: '09351239988',
			companyId: 'comp_3',
			companyName: 'بازرگانی خودرو پارس سپهر',
			cargoType: 'vehicles',
			entryDateTime: '1405/06/04 ۱۱:۲۰',
			operationType: 'unloading',
			parkingLocation: 'پارکینگ خودروهای وارداتی',
			entranceFeeCalculated: 8000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'تریلی خودروبر ۲ دستگاه سانتافه صفر',
		},
		{
			id: 'vis_wgn_7',
			trackingCode: 'RG-1405-00135',
			targetType: 'wagon',
			wagonNumber: 'WGN-990145',
			companyId: 'comp_1',
			companyName: 'شرکت لجستیک و ترانزیت خاورمیانه',
			cargoType: 'general',
			entryDateTime: '1405/06/04 ۱۱:۴۵',
			operationType: 'unloading',
			parkingLocation: 'خط ۲ ریلی - انبار غلات',
			entranceFeeCalculated: 35000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: 'واگن مسقف حامل ۵۵ تن گندم دامی',
		},
		...MOCK_SITE_VISITS,
	])

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY_VISITS)
			if (saved) {
				setVisits(JSON.parse(saved))
			}
		} catch {
			// ignore
		}
	}, [])

	// Filters State
	const [activeTab, setActiveTab] = useState<TrafficTabStatus>('inside')
	const [searchQuery, setSearchQuery] = useState('')
	const [transportTypeFilter, setTransportTypeFilter] = useState<TransportTypeFilter>('all')
	const [financialFilter, setFinancialFilter] = useState<FinancialFilterStatus>('all')
	const [sortOption, setSortOption] = useState<SortOption>('newest')
	const [pageSize, setPageSize] = useState<number>(10)
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

	// Advanced filters
	const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all')
	const [cargoCategoryFilter, setCargoCategoryFilter] = useState<string>('all')

	// Manifest Detail Modal
	const [selectedVisitForManifest, setSelectedVisitForManifest] = useState<SiteVisit | null>(null)

	// Counts for Top Status Cards
	const countInside = useMemo(() => visits.filter((v) => v.status === 'inside').length, [visits])
	const countPendingOp = useMemo(() => visits.filter((v) => (v as any).status === 'pending_op').length, [visits])
	const countPendingSettlement = useMemo(() => visits.filter((v) => v.status === 'pending_settlement').length, [visits])
	const countExited = useMemo(() => visits.filter((v) => v.status === 'exited').length, [visits])
	const countCancelled = useMemo(() => visits.filter((v) => (v as any).status === 'cancelled').length, [visits])

	// Filter and Sort Logic
	const filteredAndSortedVisits = useMemo(() => {
		return visits
			.filter((v) => {
				// Tab status filter
				if (activeTab === 'inside' && v.status !== 'inside') return false
				if (activeTab === 'pending_op' && (v as any).status !== 'pending_op') return false
				if (activeTab === 'pending_settlement' && v.status !== 'pending_settlement') return false
				if (activeTab === 'exited' && v.status !== 'exited') return false
				if (activeTab === 'cancelled' && (v as any).status !== 'cancelled') return false

				// Search query
				if (searchQuery.trim()) {
					const q = searchQuery.trim().toLowerCase()
					const matchCode = v.trackingCode.toLowerCase().includes(q)
					const matchPlate = v.vehiclePlate?.toLowerCase().includes(q) || false
					const matchWagon = v.wagonNumber?.toLowerCase().includes(q) || false
					const matchDriver = v.driverName?.toLowerCase().includes(q) || false
					const matchCompany = v.companyName.toLowerCase().includes(q)
					const matchVin = v.vehicleManifest?.some((m) => m.chassisNumber.toLowerCase().includes(q)) || false
					if (!matchCode && !matchPlate && !matchWagon && !matchDriver && !matchCompany && !matchVin) {
						return false
					}
				}

				// Transport type filter
				if (transportTypeFilter === 'vehicle' && v.targetType !== 'vehicle') return false
				if (transportTypeFilter === 'wagon' && v.targetType !== 'wagon') return false

				// Advanced company filter
				if (selectedCompanyFilter !== 'all' && v.companyId !== selectedCompanyFilter) return false

				// Advanced cargo category filter
				if (cargoCategoryFilter === 'vehicles' && v.cargoType !== 'vehicles') return false
				if (cargoCategoryFilter === 'general' && v.cargoType !== 'general') return false

				return true
			})
			.sort((a, b) => {
				if (sortOption === 'newest') {
					return (b.entryDateTime || '').localeCompare(a.entryDateTime || '')
				}
				if (sortOption === 'oldest') {
					return (a.entryDateTime || '').localeCompare(b.entryDateTime || '')
				}
				if (sortOption === 'tracking_code') {
					return b.trackingCode.localeCompare(a.trackingCode)
				}
				if (sortOption === 'company') {
					return a.companyName.localeCompare(b.companyName)
				}
				return 0
			})
	}, [visits, activeTab, searchQuery, transportTypeFilter, selectedCompanyFilter, cargoCategoryFilter, sortOption])

	const displayedVisits = useMemo(() => {
		return filteredAndSortedVisits.slice(0, pageSize)
	}, [filteredAndSortedVisits, pageSize])

	const handleRefresh = () => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY_VISITS)
			if (saved) {
				setVisits(JSON.parse(saved))
			}
		} catch {
			// ignore
		}
	}

	const handleRegisterExit = (visitId: string) => {
		const updated = visits.map((v) =>
			v.id === visitId
				? {
						...v,
						status: 'exited' as const,
						exitDateTime: `${getPersianTodayDate()} ۱۸:۰۰`,
						stayDurationMinutes: 465,
				  }
				: v
		)
		setVisits(updated)
		try {
			window.localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(updated))
		} catch {
			// ignore
		}
	}

	const getTabTitle = (tab: TrafficTabStatus) => {
		switch (tab) {
			case 'inside':
				return 'فعال در سایت'
			case 'pending_op':
				return 'در انتظار عملیات'
			case 'pending_settlement':
				return 'در انتظار تسویه مالی'
			case 'exited':
				return 'خارج‌شده'
			case 'cancelled':
				return 'لغوشده'
			default:
				return 'همه پرونده‌ها'
		}
	}

	return (
		<AppLayout title="پرونده‌های سایت">
			<div className="space-y-6 text-right" dir="rtl">
				{/* Top Page Header: Right-aligned Title, Left-aligned Action Buttons */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					{/* Right Side: Page Title & Description */}
					<div>
						<h1 className="text-2xl font-black text-slate-900 tracking-tight">پرونده‌های سایت</h1>
						<p className="text-xs text-slate-500 mt-1">
							پیگیری ورود، عملیات، تسویه و خروج ناوگان جاده‌ای و ریلی
						</p>
					</div>

					{/* Left Side: Actions */}
					<div className="flex items-center gap-3">
						<Button
							variant="filled"
							size="sm"
							icon={<IoAddOutline className="w-4 h-4" />}
							onClick={() => router.push('/site-traffic/new')}
							className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
						>
							ثبت ورود جدید
						</Button>
						<Button
							variant="outlined"
							size="sm"
							icon={<IoRefreshOutline className="w-4 h-4" />}
							onClick={handleRefresh}
							className="text-slate-700 border-slate-300 hover:bg-slate-50"
						>
							تازه‌سازی
						</Button>
					</div>
				</div>

				{/* 5 Top Summary / Status Stat Cards */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
					{/* Card 1: فعال در سایت */}
					<div
						onClick={() => setActiveTab('inside')}
						className={cn(
							'bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
							activeTab === 'inside' ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200/90'
						)}
					>
						<div className="text-right">
							<span className="text-xs font-bold text-slate-500 block mb-1">فعال در سایت</span>
							<span className="text-2xl font-black text-slate-900 font-mono">{toPersianDigits(countInside)}</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
							<IoCarSportOutline className="w-6 h-6" />
						</div>
					</div>

					{/* Card 2: در انتظار عملیات */}
					<div
						onClick={() => setActiveTab('pending_op')}
						className={cn(
							'bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
							activeTab === 'pending_op' ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20' : 'border-slate-200/90'
						)}
					>
						<div className="text-right">
							<span className="text-xs font-bold text-slate-500 block mb-1">در انتظار عملیات</span>
							<span className="text-2xl font-black text-slate-900 font-mono">{toPersianDigits(countPendingOp)}</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
							<IoTimeOutline className="w-6 h-6" />
						</div>
					</div>

					{/* Card 3: در انتظار تسویه */}
					<div
						onClick={() => setActiveTab('pending_settlement')}
						className={cn(
							'bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
							activeTab === 'pending_settlement' ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/20' : 'border-slate-200/90'
						)}
					>
						<div className="text-right">
							<span className="text-xs font-bold text-slate-500 block mb-1">در انتظار تسویه</span>
							<span className="text-2xl font-black text-slate-900 font-mono">{toPersianDigits(countPendingSettlement)}</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
							<IoCardOutline className="w-6 h-6" />
						</div>
					</div>

					{/* Card 4: خارج‌شده */}
					<div
						onClick={() => setActiveTab('exited')}
						className={cn(
							'bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
							activeTab === 'exited' ? 'border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/20' : 'border-slate-200/90'
						)}
					>
						<div className="text-right">
							<span className="text-xs font-bold text-slate-500 block mb-1">خارج‌شده</span>
							<span className="text-2xl font-black text-slate-900 font-mono">{toPersianDigits(countExited)}</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
							<IoExitOutline className="w-6 h-6" />
						</div>
					</div>

					{/* Card 5: لغوشده */}
					<div
						onClick={() => setActiveTab('cancelled')}
						className={cn(
							'bg-white rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all shadow-2xs hover:shadow-xs',
							activeTab === 'cancelled' ? 'border-rose-600 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200/90'
						)}
					>
						<div className="text-right">
							<span className="text-xs font-bold text-slate-500 block mb-1">لغوشده</span>
							<span className="text-2xl font-black text-slate-900 font-mono">{toPersianDigits(countCancelled)}</span>
						</div>
						<div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
							<IoAlertCircleOutline className="w-6 h-6" />
						</div>
					</div>
				</div>

				{/* Filter & Search Main Box */}
				<Card className="p-5 space-y-4">
					{/* Status Tabs Bar - Natural RTL Order */}
					<div className="flex flex-wrap items-center justify-start gap-2 border-b border-slate-100 pb-3">
						<button
							type="button"
							onClick={() => setActiveTab('inside')}
							className={cn(
								'px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
								activeTab === 'inside'
									? 'bg-blue-600 text-white shadow-sm'
									: 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
							)}
						>
							<span className="w-2 h-2 rounded-full bg-blue-300"></span>
							<span>فعال در سایت</span>
							<span className="font-mono text-[11px] bg-white/20 px-1.5 py-0.2 rounded-full">{toPersianDigits(countInside)}</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab('pending_op')}
							className={cn(
								'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
								activeTab === 'pending_op'
									? 'bg-amber-600 text-white shadow-xs'
									: 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
							)}
						>
							<span className="w-2 h-2 rounded-full bg-amber-400"></span>
							<span>در انتظار عملیات</span>
							<span className="font-mono text-[11px] opacity-80">{toPersianDigits(countPendingOp)}</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab('pending_settlement')}
							className={cn(
								'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
								activeTab === 'pending_settlement'
									? 'bg-purple-600 text-white shadow-xs'
									: 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
							)}
						>
							<span className="w-2 h-2 rounded-full bg-purple-400"></span>
							<span>در انتظار تسویه مالی</span>
							<span className="font-mono text-[11px] opacity-80">{toPersianDigits(countPendingSettlement)}</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab('exited')}
							className={cn(
								'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
								activeTab === 'exited'
									? 'bg-emerald-600 text-white shadow-xs'
									: 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
							)}
						>
							<span className="w-2 h-2 rounded-full bg-emerald-400"></span>
							<span>خارج‌شده</span>
							<span className="font-mono text-[11px] opacity-80">{toPersianDigits(countExited)}</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveTab('cancelled')}
							className={cn(
								'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
								activeTab === 'cancelled'
									? 'bg-rose-600 text-white shadow-xs'
									: 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
							)}
						>
							<span className="w-2 h-2 rounded-full bg-rose-400"></span>
							<span>لغوشده</span>
							<span className="font-mono text-[11px] opacity-80">{toPersianDigits(countCancelled)}</span>
						</button>
					</div>

					{/* 4 Main Form Controls Row: Search on Right, Sort on Left */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-end">
						{/* Col 1 (Right): جستجو شماره پرونده یا ورود */}
						<div className="flex flex-col gap-1">
							<label className="text-xs font-semibold text-slate-700">شماره پرونده یا ورود</label>
							<div className="relative flex items-center">
								<input
									type="text"
									placeholder="برای نمونه RG-1405-00128"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-xl pr-9 pl-16 py-2.5 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
								/>
								<IoSearchOutline className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
								<button
									type="button"
									className="absolute left-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
								>
									جست‌وجو
								</button>
							</div>
						</div>

						{/* Col 2: نوع حمل */}
						<div>
							<Select
								label="نوع حمل"
								value={transportTypeFilter}
								onChange={(e) => setTransportTypeFilter(e.target.value as TransportTypeFilter)}
								options={[
									{ value: 'all', label: 'همه انواع حمل' },
									{ value: 'vehicle', label: 'جاده‌ای (تریلی / کامیون)' },
									{ value: 'wagon', label: 'ریلی (واگن باری)' },
								]}
							/>
						</div>

						{/* Col 3: وضعیت مالی */}
						<div>
							<Select
								label="وضعیت مالی"
								value={financialFilter}
								onChange={(e) => setFinancialFilter(e.target.value as FinancialFilterStatus)}
								options={[
									{ value: 'all', label: 'همه وضعیت‌های مالی' },
									{ value: 'settled', label: 'تسویه شده' },
									{ value: 'pending', label: 'در انتظار پرداخت' },
									{ value: 'credit', label: 'کسر از اعتبار / قرارداد' },
								]}
							/>
						</div>

						{/* Col 4 (Left): مرتب‌سازی */}
						<div>
							<Select
								label="مرتب‌سازی"
								value={sortOption}
								onChange={(e) => setSortOption(e.target.value as SortOption)}
								options={[
									{ value: 'newest', label: 'جدیدترین ورود' },
									{ value: 'oldest', label: 'قدیمی‌ترین ورود' },
									{ value: 'tracking_code', label: 'شماره پرونده / کد رهگیری' },
									{ value: 'company', label: 'نام شرکت متقاضی' },
								]}
							/>
						</div>
					</div>

					{/* Collapsible Filter Trigger */}
					<div
						onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
						className="border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors bg-slate-50/50"
					>
						<div className="flex items-center gap-2 text-xs font-bold text-slate-700">
							<IoFilterOutline className="w-4 h-4 text-blue-600" />
							<span>فیلترهای تکمیلی</span>
						</div>
						<div className="flex items-center gap-1 text-slate-400 text-xs">
							{showAdvancedFilters ? <IoChevronUpOutline className="w-4 h-4" /> : <IoChevronDownOutline className="w-4 h-4" />}
						</div>
					</div>

					{/* Advanced Filters Expandable Content */}
					{showAdvancedFilters && (
						<div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-150">
							<Select
								label="فیلتر بر اساس شرکت مالک کالا"
								value={selectedCompanyFilter}
								onChange={(e) => setSelectedCompanyFilter(e.target.value)}
								options={[
									{ value: 'all', label: 'همه شرکت‌ها' },
									...MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name })),
								]}
							/>
							<Select
								label="نوع محموله"
								value={cargoCategoryFilter}
								onChange={(e) => setCargoCategoryFilter(e.target.value)}
								options={[
									{ value: 'all', label: 'همه محموله‌ها' },
									{ value: 'general', label: 'کالای عمومی / فله / کانتینری' },
									{ value: 'vehicles', label: 'حامل خودرو سواری وارداتی' },
								]}
							/>
						</div>
					)}
				</Card>

				{/* Section Header above Table: Title on Right, Page Size Selector on Left */}
				<div className="flex items-center justify-between pt-1">
					{/* Right Side: Title and matched files count */}
					<div className="text-right">
						<h3 className="font-black text-slate-900 text-base">{getTabTitle(activeTab)}</h3>
						<p className="text-xs text-slate-500 font-medium">
							{toPersianDigits(filteredAndSortedVisits.length)} پرونده مطابق فیلترها
						</p>
					</div>

					{/* Left Side: Rows per page selector */}
					<div className="w-32">
						<select
							value={pageSize}
							onChange={(e) => setPageSize(Number(e.target.value))}
							className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none transition-all focus:border-blue-600 shadow-2xs"
						>
							<option value={10}>۱۰ ردیف</option>
							<option value={25}>۲۵ ردیف</option>
							<option value={50}>۵۰ ردیف</option>
						</select>
					</div>
				</div>

				{/* Visits Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>شماره پرونده / کد ورود</TableHead>
								<TableHead>نوع حمل</TableHead>
								<TableHead>پلاک / شماره واگن</TableHead>
								<TableHead>راننده / متصدی</TableHead>
								<TableHead>شرکت مالک بار</TableHead>
								<TableHead>نوع محموله</TableHead>
								<TableHead>زمان ورود</TableHead>
								<TableHead>موقعیت استقرار</TableHead>
								<TableHead>وضعیت مالی</TableHead>
								<TableHead>عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{displayedVisits.map((v) => {
								const hasCarManifest = v.vehicleManifest && v.vehicleManifest.length > 0

								return (
									<TableRow key={v.id}>
										{/* شماره پرونده */}
										<TableCell className="font-mono font-bold text-blue-900 text-xs">
											{v.trackingCode}
										</TableCell>

										{/* نوع حمل */}
										<TableCell>
											{v.targetType === 'vehicle' ? (
												<span className="flex items-center gap-1 text-xs text-blue-700 font-bold">
													<IoCarSportOutline className="w-4 h-4" /> جاده‌ای
												</span>
											) : (
												<span className="flex items-center gap-1 text-xs text-indigo-700 font-bold">
													<IoTrainOutline className="w-4 h-4" /> ریلی
												</span>
											)}
										</TableCell>

										{/* پلاک یا شماره واگن */}
										<TableCell>
											{v.targetType === 'vehicle' && v.vehiclePlate ? (
												<IranPlateView plate={v.vehiclePlate} size="sm" />
											) : (
												<span className="font-mono font-bold text-indigo-900 text-xs">{v.wagonNumber || '-'}</span>
											)}
										</TableCell>

										{/* راننده / متصدی */}
										<TableCell>
											{v.driverName ? (
												<div>
													<p className="text-xs font-semibold text-slate-800">{v.driverName}</p>
													<p className="text-[11px] text-slate-400 font-mono">{v.driverPhone}</p>
												</div>
											) : (
												<span className="text-slate-400 text-xs">متصدی قطار ریلی</span>
											)}
										</TableCell>

										{/* شرکت متقاضی */}
										<TableCell className="max-w-[150px] truncate font-semibold text-slate-800">
											{v.companyName}
										</TableCell>

										{/* نوع محموله */}
										<TableCell>
											{hasCarManifest ? (
												<button
													type="button"
													onClick={() => setSelectedVisitForManifest(v)}
													className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
												>
													<IoCarSportOutline className="w-3.5 h-3.5 text-blue-600" />
													<span>{toPersianDigits(v.vehicleManifest!.length)} دستگاه خودرو</span>
													<IoEyeOutline className="w-3 h-3 text-slate-400 mr-1" />
												</button>
											) : v.cargoType === 'vehicles' ? (
												<Badge variant="primary">خودرو سواری</Badge>
											) : (
												<Badge variant="neutral">کالای عمومی</Badge>
											)}
										</TableCell>

										{/* زمان ورود */}
										<TableCell className="text-xs font-mono">{v.entryDateTime}</TableCell>

										{/* موقعیت استقرار */}
										<TableCell className="text-xs text-slate-600 max-w-[130px] truncate font-medium">
											{v.parkingLocation || 'سکوی ۱'}
										</TableCell>

										{/* وضعیت مالی */}
										<TableCell>
											<Badge variant="success">تسویه شده</Badge>
										</TableCell>

										{/* عملیات */}
										<TableCell>
											<div className="flex items-center gap-1.5">
												{v.status === 'inside' ? (
													<Button
														variant="outlined"
														size="sm"
														icon={<IoExitOutline className="w-3.5 h-3.5 text-rose-600" />}
														onClick={() => handleRegisterExit(v.id)}
														className="text-xs py-1 px-2"
													>
														ثبت خروج
													</Button>
												) : (
													<span className="text-xs text-slate-400 font-medium">خارج شده ✓</span>
												)}
											</div>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>

					{displayedVisits.length === 0 && (
						<div className="py-12 text-center text-slate-400 text-xs">
							پرونده‌ای مطابق با فیلترهای انتخابی یافت نشد.
						</div>
					)}
				</Card>
			</div>

			{/* Modal: View Carrier Manifest Details */}
			{selectedVisitForManifest && (
				<Modal
					isOpen={!!selectedVisitForManifest}
					onClose={() => setSelectedVisitForManifest(null)}
					title={`مانیفست خودروهای محموله: ${selectedVisitForManifest.vehiclePlate || selectedVisitForManifest.wagonNumber}`}
					maxWidth="xl"
				>
					<div className="space-y-4 text-right" dir="rtl">
						<div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
							<div>
								<span className="text-slate-400 block mb-0.5">شرکت مالک:</span>
								<span className="font-bold text-slate-800">{selectedVisitForManifest.companyName}</span>
							</div>
							<div>
								<span className="text-slate-400 block mb-0.5">راننده / مسئول:</span>
								<span className="font-bold text-slate-800">{selectedVisitForManifest.driverName || 'واگن ریلی'}</span>
							</div>
							<div>
								<span className="text-slate-400 block mb-0.5">زمان پذیرش:</span>
								<span className="font-semibold">{selectedVisitForManifest.entryDateTime}</span>
							</div>
						</div>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ردیف</TableHead>
									<TableHead>شماره شاسی (VIN)</TableHead>
									<TableHead>برند و مدل</TableHead>
									<TableHead>رنگ</TableHead>
									<TableHead>ارزش ($)</TableHead>
									<TableHead>فرآیند و وضعیت</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{selectedVisitForManifest.vehicleManifest?.map((car, idx) => (
									<TableRow key={car.id}>
										<TableCell className="font-bold text-xs">{toPersianDigits(idx + 1)}</TableCell>
										<TableCell className="font-mono font-bold text-blue-900 text-xs">
											{car.chassisNumber}
										</TableCell>
										<TableCell className="font-semibold text-slate-800">{car.brandAndModel}</TableCell>
										<TableCell className="text-xs">{car.color}</TableCell>
										<TableCell className="font-bold text-emerald-700 font-mono text-xs">
											${toPersianDigits(car.valueUsd.toLocaleString('en-US'))}
										</TableCell>
										<TableCell>
											{car.status === 'in_stock' ? (
												<Badge variant="success">ثبت در انبار</Badge>
											) : (
												<Badge variant="neutral">خروج روزانه</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Modal>
			)}
		</AppLayout>
	)
}
