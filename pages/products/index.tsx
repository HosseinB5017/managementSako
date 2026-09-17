import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_PRODUCTS } from '@/lib/mock-data/logistics-mock'
import { Product, ProductStorageType, ProductHazardNature, VehicleProductSpecs } from '@/lib/types/logistics'
import { formatToman, toPersianDigits, cn } from '@/lib/utils/formatters'
import {
	IoCubeOutline,
	IoAddOutline,
	IoSearchOutline,
	IoCarSportOutline,
	IoFlameOutline,
	IoWarningOutline,
	IoShieldCheckmarkOutline,
	IoFlashOutline,
} from 'react-icons/io5'

const STORAGE_KEY_PRODUCTS = 'managesako-products'

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState<string>('all')
	const [hazardFilter, setHazardFilter] = useState<string>('all')
	const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false)

	// Load from localStorage on mount
	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY_PRODUCTS)
			if (saved) {
				const parsed = JSON.parse(saved) as Product[]
				if (Array.isArray(parsed) && parsed.length > 0) {
					// Merge saved with mocks without duplication
					const existingIds = new Set(parsed.map((p) => p.id))
					const combined = [...parsed, ...MOCK_PRODUCTS.filter((m) => !existingIds.has(m.id))]
					setProducts(combined)
				}
			}
		} catch {
			// ignore
		}
	}, [])

	// General form fields
	const [code, setCode] = useState('')
	const [name, setName] = useState('')
	const [categoryName, setCategoryName] = useState('عمومی')
	const [unit, setUnit] = useState<Product['unit']>('ton')
	const [hazardNature, setHazardNature] = useState<ProductHazardNature>('normal')
	const [storageType, setStorageType] = useState<ProductStorageType>('normal')
	const [valueToman, setValueToman] = useState<number>(50000000)

	// Vehicle (ماشین) specific fields
	const [chassisNumber, setChassisNumber] = useState('')
	const [brandAndModel, setBrandAndModel] = useState('')
	const [modelYear, setModelYear] = useState('2024')
	const [color, setColor] = useState('')
	const [valueUsd, setValueUsd] = useState<number>(45000)

	const isVehicleCategory = categoryName === 'ماشین' || categoryName === 'خودرو' || hazardNature === 'valuable'

	const handleCategoryChange = (cat: string) => {
		setCategoryName(cat)
		if (cat === 'ماشین' || cat === 'خودرو') {
			setHazardNature('valuable')
			setStorageType('valuable')
			setUnit('device')
		} else if (cat === 'پتروشیمی و پلیمری') {
			setHazardNature('dangerous')
			setStorageType('dangerous')
			setUnit('ton')
		} else if (cat === 'فلزات و فولاد') {
			setHazardNature('heavy')
			setStorageType('normal')
			setUnit('ton')
		}
	}

	const handleHazardSelect = (nature: ProductHazardNature) => {
		setHazardNature(nature)
		if (nature === 'dangerous') {
			setStorageType('dangerous')
		} else if (nature === 'valuable') {
			setStorageType('valuable')
			if (!categoryName || categoryName === 'عمومی') {
				setCategoryName('ماشین')
			}
		} else if (nature === 'heavy') {
			if (storageType === 'dangerous') setStorageType('normal')
		} else {
			if (storageType === 'dangerous') setStorageType('normal')
		}
	}

	const handleCreateProduct = (e: React.FormEvent) => {
		e.preventDefault()

		let vehicleSpecs: VehicleProductSpecs | undefined = undefined
		if (isVehicleCategory) {
			vehicleSpecs = {
				chassisNumber: chassisNumber.trim(),
				brandAndModel: brandAndModel.trim() || name,
				modelYear: modelYear.trim(),
				color: color.trim(),
				valueUsd: Number(valueUsd) || 0,
			}
		}

		const isDangerous = hazardNature === 'dangerous' || storageType === 'dangerous'
		const isHeavy = hazardNature === 'heavy'
		const isValuable = hazardNature === 'valuable' || isVehicleCategory

		const newProd: Product = {
			id: `prod_${Date.now()}`,
			code: code.trim(),
			name: name.trim(),
			categoryId: isVehicleCategory ? 'cat_auto' : hazardNature === 'dangerous' ? 'cat_chem' : 'cat_general',
			categoryName: categoryName.trim(),
			unit: isVehicleCategory ? 'device' : unit,
			storageType,
			hazardNature,
			isDangerous,
			isHeavy,
			isValuable,
			estimatedValueRial: isVehicleCategory && vehicleSpecs ? vehicleSpecs.valueUsd * 600000000 : valueToman * 10,
			vehicleSpecs,
			currentStockTotal: 1,
		}

		const updated = [newProd, ...products]
		setProducts(updated)
		try {
			window.localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(updated))
		} catch {
			// ignore
		}

		// Reset form
		setIsNewProductModalOpen(false)
		setName('')
		setCode('')
		setCategoryName('عمومی')
		setUnit('ton')
		setHazardNature('normal')
		setStorageType('normal')
		setChassisNumber('')
		setBrandAndModel('')
		setColor('')
	}

	const filteredProducts = products.filter((p) => {
		const matchSearch =
			p.name.includes(searchTerm) ||
			p.code.includes(searchTerm) ||
			(p.vehicleSpecs?.chassisNumber && p.vehicleSpecs.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(p.vehicleSpecs?.brandAndModel && p.vehicleSpecs.brandAndModel.includes(searchTerm))

		const nature = p.hazardNature || (p.isDangerous ? 'dangerous' : p.isHeavy ? 'heavy' : p.isValuable ? 'valuable' : 'normal')

		if (hazardFilter !== 'all' && nature !== hazardFilter) return false

		if (categoryFilter === 'all') return matchSearch
		if (categoryFilter === 'vehicle') return matchSearch && (p.categoryName === 'ماشین' || p.categoryName === 'خودرو' || !!p.vehicleSpecs)
		if (categoryFilter === 'others') return matchSearch && p.categoryName !== 'ماشین' && p.categoryName !== 'خودرو' && !p.vehicleSpecs
		return matchSearch
	})

	return (
		<AppLayout title="مدیریت کالاها و مشخصات محموله‌ها">
			<div className="space-y-6 text-right" dir="rtl">
				{/* Top Page Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black text-slate-900 tracking-tight">کاتالوگ کالاها و محموله‌ها</h1>
						<p className="text-xs text-slate-500 mt-1">
							تعریف مشخصات، طبقه‌بندی ماهیت (عادی، خطرناک، سنگین/ترافیکی) و خودروها با شماره شاسی و ارزش‌گذاری
						</p>
					</div>
					<Button
						variant="filled"
						size="sm"
						icon={<IoAddOutline className="w-4 h-4" />}
						onClick={() => setIsNewProductModalOpen(true)}
					>
						تعریف کالا / محموله جدید
					</Button>
				</div>

				{/* Filter & Search Bar */}
				<Card>
					<CardContent className="p-4 space-y-4">
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
							<div className="w-full md:w-80">
								<Input
									placeholder="جستجو بر اساس نام کالا، شماره شاسی، برند یا کد..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									icon={<IoSearchOutline className="w-4 h-4" />}
								/>
							</div>

							{/* Classification / Nature Filter */}
							<div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
								<span className="text-xs font-bold text-slate-500 ml-1">فیلتر ماهیت:</span>
								<Button
									variant={hazardFilter === 'all' ? 'filled' : 'outlined'}
									size="sm"
									onClick={() => setHazardFilter('all')}
								>
									همه ({toPersianDigits(products.length)})
								</Button>
								<Button
									variant={hazardFilter === 'normal' ? 'filled' : 'outlined'}
									size="sm"
									icon={<IoShieldCheckmarkOutline className="w-3.5 h-3.5" />}
									onClick={() => setHazardFilter('normal')}
								>
									عادی
								</Button>
								<Button
									variant={hazardFilter === 'dangerous' ? 'filled' : 'outlined'}
									size="sm"
									icon={<IoFlameOutline className="w-3.5 h-3.5 text-rose-500" />}
									onClick={() => setHazardFilter('dangerous')}
								>
									خطرناک (ADR)
								</Button>
								<Button
									variant={hazardFilter === 'heavy' ? 'filled' : 'outlined'}
									size="sm"
									icon={<IoWarningOutline className="w-3.5 h-3.5 text-amber-500" />}
									onClick={() => setHazardFilter('heavy')}
								>
									سنگین / ترافیکی
								</Button>
								<Button
									variant={hazardFilter === 'valuable' ? 'filled' : 'outlined'}
									size="sm"
									icon={<IoCarSportOutline className="w-3.5 h-3.5 text-blue-500" />}
									onClick={() => setHazardFilter('valuable')}
								>
									باارزش / ماشین
								</Button>
							</div>
						</div>

						{/* Category Tabs */}
						<div className="flex gap-2 pt-2 border-t border-slate-100">
							<Button
								variant={categoryFilter === 'all' ? 'filled' : 'outlined'}
								size="sm"
								onClick={() => setCategoryFilter('all')}
							>
								همه دسته‌بندی‌ها
							</Button>
							<Button
								variant={categoryFilter === 'vehicle' ? 'filled' : 'outlined'}
								size="sm"
								icon={<IoCarSportOutline className="w-3.5 h-3.5" />}
								onClick={() => setCategoryFilter('vehicle')}
							>
								دسته‌بندی خودروها ({toPersianDigits(products.filter((p) => p.categoryName === 'ماشین' || p.categoryName === 'خودرو' || !!p.vehicleSpecs).length)})
							</Button>
							<Button
								variant={categoryFilter === 'others' ? 'filled' : 'outlined'}
								size="sm"
								onClick={() => setCategoryFilter('others')}
							>
								سایر کالاها و فله
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Products Table */}
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>کد کالا</TableHead>
								<TableHead>نام کالا / خودرو</TableHead>
								<TableHead>دسته‌بندی</TableHead>
								<TableHead>ماهیت و طبقه‌بندی کالا</TableHead>
								<TableHead>مشخصات فنی و پارامترها</TableHead>
								<TableHead>واحد</TableHead>
								<TableHead>ارزش تخمینی</TableHead>
								<TableHead>شرایط انبارداری</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredProducts.map((p) => {
								const isCar = p.categoryName === 'ماشین' || p.categoryName === 'خودرو' || !!p.vehicleSpecs
								const nature = p.hazardNature || (p.isDangerous ? 'dangerous' : p.isHeavy ? 'heavy' : p.isValuable ? 'valuable' : 'normal')

								return (
									<TableRow key={p.id}>
										<TableCell className="font-mono text-xs font-bold text-blue-700">{p.code}</TableCell>
										<TableCell>
											<div className="font-bold text-slate-900 flex items-center gap-1.5">
												{isCar && <IoCarSportOutline className="w-4 h-4 text-blue-600" />}
												<span>{p.name}</span>
											</div>
										</TableCell>
										<TableCell>
											{isCar ? (
												<Badge variant="primary">ماشین / خودرو</Badge>
											) : (
												<span className="text-xs text-slate-600 font-medium">{p.categoryName}</span>
											)}
										</TableCell>
										<TableCell>
											{nature === 'dangerous' && (
												<Badge variant="error" className="flex items-center gap-1 w-fit">
													<IoFlameOutline className="w-3.5 h-3.5" />
													<span>خطرناک (ADR)</span>
												</Badge>
											)}
											{nature === 'heavy' && (
												<Badge variant="warning" className="flex items-center gap-1 w-fit">
													<IoWarningOutline className="w-3.5 h-3.5" />
													<span>سنگین / ترافیکی</span>
												</Badge>
											)}
											{nature === 'valuable' && (
												<Badge variant="primary" className="flex items-center gap-1 w-fit">
													<IoFlashOutline className="w-3.5 h-3.5" />
													<span>باارزش / حساس</span>
												</Badge>
											)}
											{nature === 'normal' && (
												<Badge variant="neutral" className="flex items-center gap-1 w-fit">
													<IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
													<span>کالای عادی</span>
												</Badge>
											)}
										</TableCell>
										<TableCell>
											{p.vehicleSpecs ? (
												<div className="space-y-0.5 text-xs">
													<div className="font-mono font-bold text-slate-800 flex items-center gap-1">
														<span className="text-[10px] text-slate-400 font-sans">شاسی:</span>
														<span>{p.vehicleSpecs.chassisNumber}</span>
													</div>
													<div className="text-[11px] text-slate-500">
														{p.vehicleSpecs.brandAndModel} | مدل {toPersianDigits(p.vehicleSpecs.modelYear)} | رنگ {p.vehicleSpecs.color}
													</div>
												</div>
											) : (
												<div className="space-y-1 text-xs">
													<div><span className="text-slate-400">موجودی:</span> {toPersianDigits(p.currentStockTotal)} {p.unit === 'ton' ? 'تن' : p.unit === 'kg' ? 'کیلوگرم' : 'دستگاه'}</div>
													{p.description && <div className="text-slate-500 text-[11px]">{p.description}</div>}
												</div>
											)}
										</TableCell>
										<TableCell className="font-semibold text-slate-800 text-xs">
											{p.unit === 'number' || p.unit === 'device' ? 'دستگاه / عدد' : p.unit === 'ton' ? 'تن' : 'کیلوگرم'}
										</TableCell>
										<TableCell>
											{p.vehicleSpecs ? (
												<div>
													<span className="font-bold text-emerald-700 font-mono text-xs">
														${toPersianDigits(p.vehicleSpecs.valueUsd.toLocaleString('en-US'))}
													</span>
													<span className="text-[10px] text-slate-400 block">دلار</span>
												</div>
											) : (
												<span className="text-xs font-semibold text-slate-700">
													{p.estimatedValueRial ? formatToman(p.estimatedValueRial) : '-'}
												</span>
											)}
										</TableCell>
										<TableCell>
											{p.storageType === 'normal' && <Badge variant="neutral">انبار عادی / روباز</Badge>}
											{p.storageType === 'dangerous' && <Badge variant="error">انبار ایزوله مواد خطرناک</Badge>}
											{p.storageType === 'valuable' && <Badge variant="warning">پارکینگ مسقف باارزش</Badge>}
											{p.storageType === 'refrigerated' && <Badge variant="primary">سردخانه</Badge>}
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</Card>

				{/* Create New Product / Vehicle Modal */}
				<Modal
					isOpen={isNewProductModalOpen}
					onClose={() => setIsNewProductModalOpen(false)}
					title="تعریف و ثبت کالای جدید در کاتالوگ"
					maxWidth="lg"
				>
					<form onSubmit={handleCreateProduct} className="space-y-5 text-right" dir="rtl">
						{/* انتخاب نوع ماهیت کالا - بخش درخواستی کاربر */}
						<div className="space-y-2">
							<label className="block text-xs font-bold text-slate-800">
								نوع ماهیت و شرایط ویژه کالا: <span className="text-rose-500">*</span>
							</label>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
								<button
									type="button"
									onClick={() => handleHazardSelect('normal')}
									className={cn(
										'p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer',
										hazardNature === 'normal'
											? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-100'
											: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
									)}
								>
									<IoShieldCheckmarkOutline className="w-5 h-5" />
									<span>کالای عادی</span>
								</button>

								<button
									type="button"
									onClick={() => handleHazardSelect('dangerous')}
									className={cn(
										'p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer',
										hazardNature === 'dangerous'
											? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-100'
											: 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
									)}
								>
									<IoFlameOutline className="w-5 h-5" />
									<span>کالای خطرناک (ADR)</span>
								</button>

								<button
									type="button"
									onClick={() => handleHazardSelect('heavy')}
									className={cn(
										'p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer',
										hazardNature === 'heavy'
											? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-100'
											: 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
									)}
								>
									<IoWarningOutline className="w-5 h-5" />
									<span>سنگین / ترافیکی</span>
								</button>

								<button
									type="button"
									onClick={() => handleHazardSelect('valuable')}
									className={cn(
										'p-3 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer',
										hazardNature === 'valuable'
											? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-100'
											: 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
									)}
								>
									<IoCarSportOutline className="w-5 h-5" />
									<span>باارزش / خودرو سواری</span>
								</button>
							</div>
						</div>

						{/* دسته‌بندی و واحد */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Select
								label="دسته‌بندی کالا"
								value={categoryName}
								onChange={(e) => handleCategoryChange(e.target.value)}
								options={[
									{ value: 'عمومی', label: 'عمومی و متفرقه' },
									{ value: 'ماشین', label: 'ماشین (خودرو سواری / سنگین)' },
									{ value: 'فلزات و فولاد', label: 'فلزات و فولاد' },
									{ value: 'غلات و کشاورزی', label: 'غلات و کشاورزی' },
									{ value: 'پتروشیمی و پلیمری', label: 'پتروشیمی و پلیمری' },
									{ value: 'مصالح ساختمانی', label: 'مصالح ساختمانی' },
									{ value: 'سایر کالاها', label: 'سایر کالاها' },
								]}
							/>
							<Select
								label="واحد سنجش کالا"
								value={isVehicleCategory ? 'device' : unit}
								disabled={isVehicleCategory}
								onChange={(e) => setUnit(e.target.value as Product['unit'])}
								options={[
									{ value: 'ton', label: 'تن' },
									{ value: 'kg', label: 'کیلوگرم' },
									{ value: 'device', label: 'دستگاه / عدد' },
									{ value: 'number', label: 'تعداد' },
								]}
							/>
						</div>

						{/* کد و نام کالا */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input
								label="کد کالا / پارت‌نامبر"
								placeholder="مثال: PRD-2001"
								required
								value={code}
								onChange={(e) => setCode(e.target.value)}
							/>
							<Input
								label={isVehicleCategory ? 'عنوان خودرو / ماشین' : 'نام کامل کالا'}
								required
								placeholder={isVehicleCategory ? 'مثال: لکسوس LX600 مدل 2024' : 'نام کالا'}
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						{/* مشخصات اختصاصی خودرو در صورت انتخاب ماهیت باارزش/ماشین */}
						{isVehicleCategory && (
							<div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
								<div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 border-b border-blue-200 pb-2">
									<IoCarSportOutline className="w-4 h-4 text-blue-700" />
									<span>مشخصات اختصاصی خودرو (شناسه، رنگ و ارزش دلاری)</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Input
										label="شماره شاسی (VIN)"
										required
										placeholder="مثال: JTMHU01J8N4109882"
										value={chassisNumber}
										onChange={(e) => setChassisNumber(e.target.value)}
									/>
									<Input
										label="نام و برند خودروساز"
										required
										placeholder="مثال: Toyota Land Cruiser"
										value={brandAndModel}
										onChange={(e) => setBrandAndModel(e.target.value)}
									/>
								</div>

								<div className="grid grid-cols-3 gap-3">
									<Input
										label="مدل سال"
										required
										placeholder="2024 / 1403"
										value={modelYear}
										onChange={(e) => setModelYear(e.target.value)}
									/>
									<Input
										label="رنگ بدنه"
										required
										placeholder="سفید صدفی، مشکی و..."
										value={color}
										onChange={(e) => setColor(e.target.value)}
									/>
									<Input
										label="ارزش قیمتی (دلار $)"
										type="number"
										required
										min="1"
										placeholder="مثال: 55000"
										value={valueUsd}
										onChange={(e) => setValueUsd(Number(e.target.value) || 0)}
									/>
								</div>
							</div>
						)}

						{/* شرایط انبارداری و ارزش ریالی */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Select
								label="شرایط انبارداری و نگهداری"
								value={storageType}
								onChange={(e) => setStorageType(e.target.value as ProductStorageType)}
								options={[
									{ value: 'normal', label: 'عادی (انبار سرپوشیده یا محوطه روباز)' },
									{ value: 'dangerous', label: 'خطرناک / شیمیایی (سالن ایزوله و ضدحریق)' },
									{ value: 'valuable', label: 'ارزشمند / حساس (پارکینگ اختصاصی مسقف)' },
									{ value: 'refrigerated', label: 'سردخانه‌ای' },
								]}
							/>
							{!isVehicleCategory && (
								<Input
									label="ارزش تخمینی هر تن (تومان)"
									type="number"
									value={valueToman}
									onChange={(e) => setValueToman(Number(e.target.value) || 0)}
								/>
							)}
						</div>

						{/* دکمه‌های فرم */}
						<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
							<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewProductModalOpen(false)}>
								انصراف
							</Button>
							<Button type="submit" variant="filled" size="sm">
								{isVehicleCategory ? 'ثبت خودرو در کاتالوگ' : 'ذخیره مشخصات کالا'}
							</Button>
						</div>
					</form>
				</Modal>
			</div>
		</AppLayout>
	)
}
