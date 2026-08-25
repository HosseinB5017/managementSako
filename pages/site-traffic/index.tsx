import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
	MOCK_SITE_VISITS,
	MOCK_COMPANIES,
} from '@/lib/mock-data/logistics-mock'
import { SiteVisit, VehicleCargoItem } from '@/lib/types/logistics'
import { formatToman, toPersianDigits, getPersianTodayDate } from '@/lib/utils/formatters'
import {
	IoEnterOutline,
	IoExitOutline,
	IoCarSportOutline,
	IoTrainOutline,
	IoAddOutline,
	IoSearchOutline,
	IoCheckmarkCircleOutline,
	IoBarcodeOutline,
	IoTrashOutline,
	IoEyeOutline,
} from 'react-icons/io5'

export default function SiteTrafficPage() {
	const [visits, setVisits] = useState<SiteVisit[]>([
		{
			id: 'vis_car_trans_1',
			trackingCode: 'VIS-405-08',
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
		...MOCK_SITE_VISITS,
	])

	const [searchTerm, setSearchTerm] = useState('')
	const [filterStatus, setFilterStatus] = useState<'all' | 'inside' | 'exited' | 'vehicles'>('all')

	// Entry Modal State
	const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false)
	const [targetType, setTargetType] = useState<'vehicle' | 'wagon'>('vehicle')
	const [isCarCarrier, setIsCarCarrier] = useState(false) // آیا حامل ماشین سواری است؟
	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[2]?.id || MOCK_COMPANIES[0].id)
	const [plateOrNumber, setPlateOrNumber] = useState('')
	const [driverName, setDriverName] = useState('')
	const [driverPhone, setDriverPhone] = useState('')
	const [operationType, setOperationType] = useState<any>('unloading')
	const [parkingLocation, setParkingLocation] = useState('سکوی خودروهای وارداتی')

	// Vehicles list inside the carrier (Manifest)
	const [manifestCars, setManifestCars] = useState<
		{ chassisNumber: string; brandAndModel: string; modelYear: string; color: string; valueUsd: number; destination: 'warehouse' | 'daily_exit' }[]
	>([
		{ chassisNumber: '', brandAndModel: 'تویوتا لندکروزر', modelYear: '2024', color: 'سفید', valueUsd: 85000, destination: 'warehouse' },
	])

	// View Manifest Modal
	const [selectedVisitForManifest, setSelectedVisitForManifest] = useState<SiteVisit | null>(null)

	const handleAddCarRow = () => {
		setManifestCars([
			...manifestCars,
			{ chassisNumber: '', brandAndModel: '', modelYear: '2024', color: 'مشکی', valueUsd: 50000, destination: 'warehouse' },
		])
	}

	const handleRemoveCarRow = (idx: number) => {
		setManifestCars(manifestCars.filter((_, i) => i !== idx))
	}

	const handleUpdateCarRow = (idx: number, field: string, value: any) => {
		const updated = [...manifestCars]
		updated[idx] = { ...updated[idx], [field]: value }
		setManifestCars(updated)
	}

	const handleRegisterEntry = (e: React.FormEvent) => {
		e.preventDefault()
		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!

		let generatedManifest: VehicleCargoItem[] | undefined = undefined
		if (isCarCarrier && manifestCars.length > 0) {
			generatedManifest = manifestCars
				.filter((c) => c.chassisNumber.trim().length > 0)
				.map((c, i) => ({
					id: `v_manifest_${Date.now()}_${i}`,
					chassisNumber: c.chassisNumber.trim().toUpperCase(),
					brandAndModel: c.brandAndModel || 'خودرو سواری',
					modelYear: c.modelYear,
					color: c.color,
					valueUsd: c.valueUsd,
					companyId: company.id,
					companyName: company.name,
					warehouseName: c.destination === 'warehouse' ? 'پارکینگ خودروهای انبار' : 'ترانزیت خروج روزانه',
					locationCode: c.destination === 'warehouse' ? `PARK-${i + 10}` : 'خروجی سریع',
					entryDate: getPersianTodayDate(),
					status: c.destination === 'warehouse' ? 'in_stock' : 'dispatched',
					notes: c.destination === 'warehouse' ? 'ورود مستقیم به انبار' : 'ترخیص و خروج در همان روز',
				}))
		}

		const newVisit: SiteVisit = {
			id: `vis_${Date.now()}`,
			trackingCode: `VIS-405-0${visits.length + 1}`,
			targetType,
			vehiclePlate: targetType === 'vehicle' ? plateOrNumber : undefined,
			wagonNumber: targetType === 'wagon' ? plateOrNumber : undefined,
			driverName: targetType === 'vehicle' ? driverName : undefined,
			driverPhone: targetType === 'vehicle' ? driverPhone : undefined,
			companyId: company.id,
			companyName: company.name,
			cargoType: isCarCarrier ? 'vehicles' : 'general',
			vehicleManifest: generatedManifest,
			entryDateTime: `${getPersianTodayDate()} ۱۰:۱۵`,
			operationType,
			parkingLocation,
			entranceFeeCalculated: targetType === 'vehicle' ? 8000000 : 35000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: isCarCarrier
				? `حامل ${toPersianDigits(generatedManifest?.length || 0)} دستگاه خودرو سواری`
				: undefined,
		}

		setVisits([newVisit, ...visits])
		setIsNewVisitModalOpen(false)

		// Reset
		setPlateOrNumber('')
		setDriverName('')
		setDriverPhone('')
		setIsCarCarrier(false)
		setManifestCars([
			{ chassisNumber: '', brandAndModel: '', modelYear: '2024', color: 'سفید', valueUsd: 50000, destination: 'warehouse' },
		])
	}

	const handleRegisterExit = (visitId: string) => {
		setVisits(
			visits.map((v) =>
				v.id === visitId
					? {
							...v,
							status: 'exited',
							exitDateTime: `${getPersianTodayDate()} ۱۸:۰۰`,
							stayDurationMinutes: 465,
					  }
					: v
			)
		)
	}

	const filteredVisits = visits.filter((v) => {
		const matchSearch =
			(v.vehiclePlate && v.vehiclePlate.includes(searchTerm)) ||
			(v.wagonNumber && v.wagonNumber.includes(searchTerm)) ||
			v.companyName.includes(searchTerm) ||
			(v.driverName && v.driverName.includes(searchTerm)) ||
			(v.vehicleManifest && v.vehicleManifest.some((m) => m.chassisNumber.includes(searchTerm.toUpperCase())))

		if (filterStatus === 'inside') return matchSearch && v.status === 'inside'
		if (filterStatus === 'exited') return matchSearch && v.status === 'exited'
		if (filterStatus === 'vehicles') return matchSearch && v.cargoType === 'vehicles'
		return matchSearch
	})

	return (
		<AppLayout title="مدیریت تردد سایت و مانیفست خودروها">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">تردد سایت و پذیرش ناوگان (Site Visits)</h1>
					<p className="text-sm text-slate-500 mt-1">
						ثبت ورود تریلی خودروبر و واگن‌های حامل ماشین، ثبت مانیفست شاسی‌ها و هدایت به انبار یا خروج روزانه
					</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoAddOutline className="w-4 h-4" />}
					onClick={() => setIsNewVisitModalOpen(true)}
				>
					ثبت ورود ناوگان / خودروبر جدید
				</Button>
			</div>

			{/* Search & Tabs */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجو بر اساس پلاک، واگن، راننده، شرکت یا شماره شاسی خودرو..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
					<div className="flex gap-2 w-full sm:w-auto">
						<Button
							variant={filterStatus === 'all' ? 'filled' : 'outlined'}
							size="sm"
							onClick={() => setFilterStatus('all')}
						>
							همه ترددها ({toPersianDigits(visits.length)})
						</Button>
						<Button
							variant={filterStatus === 'vehicles' ? 'filled' : 'outlined'}
							size="sm"
							icon={<IoCarSportOutline className="w-3.5 h-3.5" />}
							onClick={() => setFilterStatus('vehicles')}
						>
							حامل خودرو سواری ({toPersianDigits(visits.filter((v) => v.cargoType === 'vehicles').length)})
						</Button>
						<Button
							variant={filterStatus === 'inside' ? 'filled' : 'outlined'}
							size="sm"
							onClick={() => setFilterStatus('inside')}
						>
							حاضر در سایت ({toPersianDigits(visits.filter((v) => v.status === 'inside').length)})
						</Button>
					</div>
				</div>
			</Card>

			{/* Visits Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>کد رهگیری</TableHead>
							<TableHead>نوع ناوگان</TableHead>
							<TableHead>پلاک / شماره واگن</TableHead>
							<TableHead>راننده</TableHead>
							<TableHead>شرکت متقاضی</TableHead>
							<TableHead>نوع محموله</TableHead>
							<TableHead>ماشین‌های بارگیری‌شده (مانیفست)</TableHead>
							<TableHead>زمان ورود</TableHead>
							<TableHead>وضعیت</TableHead>
							<TableHead>عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredVisits.map((v) => {
							const hasCarManifest = v.vehicleManifest && v.vehicleManifest.length > 0

							return (
								<TableRow key={v.id}>
									<TableCell className="font-bold text-slate-800 font-mono text-xs">{v.trackingCode}</TableCell>
									<TableCell>
										{v.targetType === 'vehicle' ? (
											<span className="flex items-center gap-1 text-xs text-blue-700 font-semibold">
												<IoCarSportOutline className="w-4 h-4" /> تریلی / کامیون
											</span>
										) : (
											<span className="flex items-center gap-1 text-xs text-indigo-700 font-semibold">
												<IoTrainOutline className="w-4 h-4" /> واگن باری
											</span>
										)}
									</TableCell>
									<TableCell className="font-bold text-slate-900">
										{v.vehiclePlate || v.wagonNumber}
									</TableCell>
									<TableCell>
										{v.driverName ? (
											<div>
												<p className="text-xs font-semibold text-slate-800">{v.driverName}</p>
												<p className="text-[11px] text-slate-400 font-mono">{v.driverPhone}</p>
											</div>
										) : (
											<span className="text-slate-400 text-xs">واگن ریلی</span>
										)}
									</TableCell>
									<TableCell className="max-w-[140px] truncate">{v.companyName}</TableCell>
									<TableCell>
										{v.cargoType === 'vehicles' ? (
											<Badge variant="primary">خودرو سواری</Badge>
										) : (
											<Badge variant="neutral">کالای عمومی</Badge>
										)}
									</TableCell>
									<TableCell>
										{hasCarManifest ? (
											<button
												onClick={() => setSelectedVisitForManifest(v)}
												className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
											>
												<IoCarSportOutline className="w-3.5 h-3.5 text-blue-600" />
												<span>{toPersianDigits(v.vehicleManifest!.length)} دستگاه خودرو</span>
												<IoEyeOutline className="w-3 h-3 text-slate-400 mr-1" />
											</button>
										) : (
											<span className="text-slate-400 text-xs">-</span>
										)}
									</TableCell>
									<TableCell className="text-xs">{v.entryDateTime}</TableCell>
									<TableCell>
										{v.status === 'inside' ? (
											<Badge variant="success">مستقر در سایت</Badge>
										) : (
											<Badge variant="neutral">خارج شده</Badge>
										)}
									</TableCell>
									<TableCell>
										{v.status === 'inside' ? (
											<Button
												variant="outlined"
												size="sm"
												icon={<IoExitOutline className="w-3.5 h-3.5 text-rose-600" />}
												onClick={() => handleRegisterExit(v.id)}
											>
												ثبت خروج
											</Button>
										) : (
											<span className="text-xs text-slate-400">تکمیل و تسویه</span>
										)}
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</Card>

			{/* Modal: New Site Visit with Vehicle Manifest */}
			<Modal
				isOpen={isNewVisitModalOpen}
				onClose={() => setIsNewVisitModalOpen(false)}
				title="ثبت ورود جدید ناوگان به سکو و لیست ماشین‌ها"
				maxWidth="2xl"
			>
				<form onSubmit={handleRegisterEntry} className="space-y-4">
					{/* Target Type Selector */}
					<div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
						<button
							type="button"
							onClick={() => setTargetType('vehicle')}
							className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
								targetType === 'vehicle' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
							}`}
						>
							<IoCarSportOutline className="w-4 h-4" />
							تریلی خودروبر / کامیون
						</button>
						<button
							type="button"
							onClick={() => setTargetType('wagon')}
							className={`py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
								targetType === 'wagon' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
							}`}
						>
							<IoTrainOutline className="w-4 h-4" />
							واگن باری ریلی (واگن دو طبقه/مسطح)
						</button>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Select
							label="شرکت متقاضی / مالک بار"
							value={selectedCompanyId}
							onChange={(e) => setSelectedCompanyId(e.target.value)}
							options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
						/>
						<Input
							label={targetType === 'vehicle' ? 'شماره پلاک تریلی خودروبر' : 'شماره واگن ریلی'}
							required
							placeholder={targetType === 'vehicle' ? 'مثال: ۹۹-A-۷۴۱ TR یا ۱۲ ع ۳۴۵' : 'مثال: WGN-880412'}
							value={plateOrNumber}
							onChange={(e) => setPlateOrNumber(e.target.value)}
						/>
					</div>

					{targetType === 'vehicle' && (
						<div className="grid grid-cols-2 gap-3">
							<Input
								label="نام راننده"
								required
								placeholder="نام و نام خانوادگی"
								value={driverName}
								onChange={(e) => setDriverName(e.target.value)}
							/>
							<Input
								label="شماره موبایل راننده"
								required
								placeholder="0912..."
								value={driverPhone}
								onChange={(e) => setDriverPhone(e.target.value)}
							/>
						</div>
					)}

					{/* Car Carrier Checkbox */}
					<div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
						<label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900">
							<input
								type="checkbox"
								checked={isCarCarrier}
								onChange={(e) => setIsCarCarrier(e.target.checked)}
								className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
							/>
							<span>این تریلی / واگن حامل خودروهای سواری است (ثبت مانیفست شماره شاسی‌ها)</span>
						</label>
					</div>

					{/* Dynamic Cars Manifest Section */}
					{isCarCarrier && (
						<div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
							<div className="flex items-center justify-between border-b border-slate-200 pb-2">
								<h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
									<IoBarcodeOutline className="w-4 h-4 text-blue-600" />
									لیست خودروهای سواری داخل بار ({toPersianDigits(manifestCars.length)} دستگاه)
								</h4>
								<Button
									type="button"
									variant="outlined"
									size="sm"
									icon={<IoAddOutline className="w-3.5 h-3.5" />}
									onClick={handleAddCarRow}
								>
									افزودن ماشین
								</Button>
							</div>

							<div className="space-y-3 max-h-60 overflow-y-auto pr-1">
								{manifestCars.map((car, index) => (
									<div
										key={index}
										className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-2xs"
									>
										<div className="flex items-center justify-between">
											<span className="font-bold text-blue-900">ماشین شماره {toPersianDigits(index + 1)}:</span>
											{manifestCars.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveCarRow(index)}
													className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
												>
													<IoTrashOutline className="w-4 h-4" />
												</button>
											)}
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
											<Input
												label="شماره شاسی (VIN)"
												required
												placeholder="مثال: JTMHU01J8N410..."
												value={car.chassisNumber}
												onChange={(e) => handleUpdateCarRow(index, 'chassisNumber', e.target.value.toUpperCase())}
											/>
											<Input
												label="نام و برند خودرو"
												placeholder="لندکروزر، سانتافه و..."
												value={car.brandAndModel}
												onChange={(e) => handleUpdateCarRow(index, 'brandAndModel', e.target.value)}
											/>
											<Input
												label="رنگ بدنه"
												placeholder="سفید، مشکی..."
												value={car.color}
												onChange={(e) => handleUpdateCarRow(index, 'color', e.target.value)}
											/>
										</div>

										<div className="grid grid-cols-2 gap-2">
											<Input
												label="ارزش دلاری ($)"
												type="number"
												value={car.valueUsd}
												onChange={(e) => handleUpdateCarRow(index, 'valueUsd', Number(e.target.value) || 0)}
											/>
											<Select
												label="مقصد و فرآیند خودرو"
												value={car.destination}
												onChange={(e) => handleUpdateCarRow(index, 'destination', e.target.value)}
												options={[
													{ value: 'warehouse', label: 'ورود به انبار (دپو در پارکینگ)' },
													{ value: 'daily_exit', label: 'ترخیص و خروج در همان روز' },
												]}
											/>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewVisitModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm" icon={<IoCheckmarkCircleOutline className="w-4 h-4" />}>
							ثبت ورود و ذخیره مانیفست
						</Button>
					</div>
				</form>
			</Modal>

			{/* Modal: View Carrier Manifest Details */}
			{selectedVisitForManifest && (
				<Modal
					isOpen={!!selectedVisitForManifest}
					onClose={() => setSelectedVisitForManifest(null)}
					title={`مانیفست خودروهای محموله: ${selectedVisitForManifest.vehiclePlate || selectedVisitForManifest.wagonNumber}`}
					maxWidth="xl"
				>
					<div className="space-y-4">
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

