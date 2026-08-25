import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_VEHICLE_CARGO_ITEMS, MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { VehicleCargoItem } from '@/lib/types/logistics'
import { toPersianDigits, getPersianTodayDate } from '@/lib/utils/formatters'
import {
	IoCarSportOutline,
	IoAddOutline,
	IoSearchOutline,
	IoBarcodeOutline,
	IoCheckmarkCircleOutline,
	IoCloseOutline,
} from 'react-icons/io5'

export default function VehicleInventoryPage() {
	const [vehicleItems, setVehicleItems] = useState<VehicleCargoItem[]>(MOCK_VEHICLE_CARGO_ITEMS)
	const [searchTerm, setSearchTerm] = useState('')
	const [isNewModalOpen, setIsNewModalOpen] = useState(false)
	const [isBatchImportOpen, setIsBatchImportOpen] = useState(false)

	// Single Vehicle form
	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[2]?.id || MOCK_COMPANIES[0].id)
	const [chassisNumber, setChassisNumber] = useState('')
	const [brandAndModel, setBrandAndModel] = useState('')
	const [modelYear, setModelYear] = useState('2024')
	const [color, setColor] = useState('سفید')
	const [valueUsd, setValueUsd] = useState<number>(50000)
	const [locationCode, setLocationCode] = useState('PARK-A-15')
	const [errorMessage, setErrorMessage] = useState('')

	// Batch Import list
	const [batchInputText, setBatchInputText] = useState(
		'JTMHU01J8N4109890, تویوتا لندکروزر, 2024, مشکی, 85000\nJTMHU01J8N4109891, تویوتا لندکروزر, 2024, سفید صدفی, 85000\nKM8RNDHF3PU712400, هیوندای سانتافه, 2025, نوک‌مدادی, 48000'
	)

	// Check if chassis is unique
	const handleAddSingleVehicle = (e: React.FormEvent) => {
		e.preventDefault()
		setErrorMessage('')

		const trimmedChassis = chassisNumber.trim().toUpperCase()

		// Validate uniqueness
		const exists = vehicleItems.some((item) => item.chassisNumber.toUpperCase() === trimmedChassis)
		if (exists) {
			setErrorMessage(`شماره شاسی «${trimmedChassis}» قبلاً در سامانه ثبت شده است و تکراری می‌باشد!`)
			return
		}

		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!

		const newItem: VehicleCargoItem = {
			id: `v_item_${Date.now()}`,
			chassisNumber: trimmedChassis,
			brandAndModel,
			modelYear,
			color,
			valueUsd: Number(valueUsd) || 0,
			companyId: company.id,
			companyName: company.name,
			warehouseName: 'پارکینگ خودروهای وارداتی',
			locationCode,
			entryDate: getPersianTodayDate(),
			status: 'in_stock',
		}

		setVehicleItems([newItem, ...vehicleItems])
		setIsNewModalOpen(false)
		setChassisNumber('')
		setBrandAndModel('')
	}

	// Batch Import (چندین شاسی همزمان)
	const handleBatchImport = () => {
		const lines = batchInputText.split('\n').filter((l) => l.trim().length > 0)
		const newCars: VehicleCargoItem[] = []
		const existingChassisList = new Set(vehicleItems.map((v) => v.chassisNumber.toUpperCase()))
		const duplicates: string[] = []

		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!

		lines.forEach((line, idx) => {
			const parts = line.split(',').map((p) => p.trim())
			const chassis = parts[0]?.toUpperCase()
			if (!chassis) return

			if (existingChassisList.has(chassis)) {
				duplicates.push(chassis)
				return
			}

			existingChassisList.add(chassis)

			newCars.push({
				id: `v_batch_${Date.now()}_${idx}`,
				chassisNumber: chassis,
				brandAndModel: parts[1] || 'خودرو سواری',
				modelYear: parts[2] || '2024',
				color: parts[3] || 'نامشخص',
				valueUsd: Number(parts[4]) || 40000,
				companyId: company.id,
				companyName: company.name,
				warehouseName: 'پارکینگ خودروهای وارداتی',
				locationCode: `PARK-LOT-${idx + 1}`,
				entryDate: getPersianTodayDate(),
				status: 'in_stock',
			})
		})

		if (duplicates.length > 0) {
			alert(`موارد تکراری نادیده گرفته شدند: ${duplicates.join(', ')}`)
		}

		setVehicleItems([...newCars, ...vehicleItems])
		setIsBatchImportOpen(false)
	}

	const filteredItems = vehicleItems.filter(
		(item) =>
			item.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.brandAndModel.includes(searchTerm) ||
			item.companyName.includes(searchTerm) ||
			item.color.includes(searchTerm) ||
			(item.locationCode && item.locationCode.toLowerCase().includes(searchTerm.toLowerCase()))
	)

	return (
		<AppLayout title="مدیریت خودروهای کالا و شماره شاسی‌ها">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">
						انبار ماشین و رهگیری شماره شاسی (VIN Registry)
					</h1>
					<p className="text-sm text-slate-500 mt-1">
						ثبت لیست کامل خودروها با شماره شاسی یکتا (Unique)، مشخصات فنی، رنگ، موقعیت در پارکینگ و ارزش دلاری
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outlined"
						size="sm"
						icon={<IoBarcodeOutline className="w-4 h-4" />}
						onClick={() => setIsBatchImportOpen(true)}
					>
						ثبت دسته‌ای شاسی‌ها (اکسل/متن)
					</Button>
					<Button
						variant="filled"
						size="sm"
						icon={<IoAddOutline className="w-4 h-4" />}
						onClick={() => setIsNewModalOpen(true)}
					>
						ثبت تک خودرو جدید
					</Button>
				</div>
			</div>

			{/* Search & Counter Bar */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجوی شماره شاسی (VIN)، برند، رنگ، شرکت مالک یا موقعیت..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
					<div className="flex items-center gap-4 text-xs font-medium text-slate-600">
						<span>
							کل خودروهای ثبت‌شده:{' '}
							<strong className="text-slate-900 font-bold">{toPersianDigits(vehicleItems.length)} دستگاه</strong>
						</span>
						<span>
							موجود در پارکینگ:{' '}
							<strong className="text-emerald-700 font-bold">
								{toPersianDigits(vehicleItems.filter((i) => i.status === 'in_stock').length)} دستگاه
							</strong>
						</span>
					</div>
				</div>
			</Card>

			{/* Vehicles Table with Unique Chassis Number Column */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ردیف</TableHead>
							<TableHead>شماره شاسی یونیک (VIN)</TableHead>
							<TableHead>نام و برند خودرو</TableHead>
							<TableHead>مدل سال</TableHead>
							<TableHead>رنگ بدنه</TableHead>
							<TableHead>ارزش دلاری ($)</TableHead>
							<TableHead>شرکت مالک بار</TableHead>
							<TableHead>موقعیت استقرار</TableHead>
							<TableHead>تاریخ ورود</TableHead>
							<TableHead>وضعیت</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredItems.map((item, index) => (
							<TableRow key={item.id}>
								<TableCell className="font-mono text-xs text-slate-400 font-bold">
									{toPersianDigits(index + 1)}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1.5 font-mono font-black text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200/80 text-xs w-fit">
										<IoBarcodeOutline className="w-4 h-4 text-blue-600" />
										<span>{item.chassisNumber}</span>
									</div>
								</TableCell>
								<TableCell className="font-bold text-slate-900">
									<div className="flex items-center gap-1.5">
										<IoCarSportOutline className="w-4 h-4 text-blue-700" />
										<span>{item.brandAndModel}</span>
									</div>
								</TableCell>
								<TableCell className="font-mono text-xs font-semibold">{item.modelYear}</TableCell>
								<TableCell className="text-xs font-medium text-slate-700">{item.color}</TableCell>
								<TableCell className="font-bold text-emerald-700 font-mono text-xs">
									${toPersianDigits(item.valueUsd.toLocaleString('en-US'))}
								</TableCell>
								<TableCell className="max-w-[150px] truncate text-slate-800 font-semibold">
									{item.companyName}
								</TableCell>
								<TableCell>
									<span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] font-bold rounded-md">
										{item.locationCode || 'محوطه عمومی'}
									</span>
								</TableCell>
								<TableCell className="text-xs text-slate-500">{item.entryDate}</TableCell>
								<TableCell>
									{item.status === 'in_stock' && <Badge variant="success">موجود در انبار</Badge>}
									{item.status === 'dispatched' && <Badge variant="neutral">ترخیص شده</Badge>}
									{item.status === 'reserved' && <Badge variant="warning">رزرو بارگیری</Badge>}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{/* Modal: Single Vehicle Registration */}
			<Modal
				isOpen={isNewModalOpen}
				onClose={() => setIsNewModalOpen(false)}
				title="ثبت خودرو جدید با شماره شاسی یکتا"
				maxWidth="md"
			>
				<form onSubmit={handleAddSingleVehicle} className="space-y-4">
					{errorMessage && (
						<div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold">
							{errorMessage}
						</div>
					)}

					<Select
						label="شرکت مالک کالا / متقاضی"
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
					/>

					<Input
						label="شماره شاسی یونیک (VIN - ۱۷ رقمی)"
						required
						placeholder="مثال: JTMHU01J8N4109899"
						value={chassisNumber}
						onChange={(e) => setChassisNumber(e.target.value.toUpperCase())}
						helperText="شماره شاسی نمی‌تواند تکراری باشد."
					/>

					<div className="grid grid-cols-2 gap-3">
						<Input
							label="نام و برند خودرو"
							required
							placeholder="تویوتا لندکروزر، سانتافه..."
							value={brandAndModel}
							onChange={(e) => setBrandAndModel(e.target.value)}
						/>
						<Input
							label="مدل سال ساخت"
							required
							placeholder="2024 / 2025"
							value={modelYear}
							onChange={(e) => setModelYear(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Input
							label="رنگ بدنه"
							required
							placeholder="سفید صدفی، مشکی، طوسی..."
							value={color}
							onChange={(e) => setColor(e.target.value)}
						/>
						<Input
							label="ارزش قیمتی (دلار $)"
							type="number"
							required
							min="1"
							value={valueUsd}
							onChange={(e) => setValueUsd(Number(e.target.value) || 0)}
						/>
					</div>

					<Input
						label="موقعیت استقرار در پارکینگ / سکو"
						value={locationCode}
						onChange={(e) => setLocationCode(e.target.value)}
					/>

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm" icon={<IoCheckmarkCircleOutline className="w-4 h-4" />}>
							ثبت خودرو و شماره شاسی
						</Button>
					</div>
				</form>
			</Modal>

			{/* Modal: Batch Import Vehicles */}
			<Modal
				isOpen={isBatchImportOpen}
				onClose={() => setIsBatchImportOpen(false)}
				title="ثبت دسته‌ای لیست خودروها (Batch Import)"
				maxWidth="lg"
			>
				<div className="space-y-4 text-xs">
					<p className="text-slate-600 leading-relaxed">
						هر خودرو را در یک خط با فرمت روبرو وارد کنید:
						<br />
						<code className="bg-slate-100 p-1.5 rounded-md font-mono block mt-1 text-slate-800">
							شماره شاسی, برند و نام خودرو, سال ساخت, رنگ, قیمت دلاری
						</code>
					</p>

					<Select
						label="شرکت مالک محموله"
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
					/>

					<div>
						<label className="text-xs font-semibold text-slate-700 block mb-1.5">
							لیست خودروها (هر خط یک دستگاه):
						</label>
						<textarea
							rows={6}
							className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-xl p-3 outline-none font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
							value={batchInputText}
							onChange={(e) => setBatchInputText(e.target.value)}
						/>
					</div>

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsBatchImportOpen(false)}>
							انصراف
						</Button>
						<Button type="button" variant="filled" size="sm" onClick={handleBatchImport}>
							اعتبارسنجی و ثبت تمام شاسی‌ها
						</Button>
					</div>
				</div>
			</Modal>
		</AppLayout>
	)
}
