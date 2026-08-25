import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_PRODUCTS, MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { Product, ProductStorageType, VehicleProductSpecs } from '@/lib/types/logistics'
import { formatToman, toPersianDigits } from '@/lib/utils/formatters'
import {
	IoCubeOutline,
	IoAddOutline,
	IoSearchOutline,
	IoCarSportOutline,
	IoInformationCircleOutline,
} from 'react-icons/io5'

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState<string>('all')
	const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false)

	// General form fields
	const [code, setCode] = useState('')
	const [name, setName] = useState('')
	const [categoryName, setCategoryName] = useState('ماشین')
	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [storageType, setStorageType] = useState<ProductStorageType>('valuable')
	const [isDangerous, setIsDangerous] = useState(false)
	const [isValuable, setIsValuable] = useState(true)
	const [valueToman, setValueToman] = useState<number>(50000000)

	// Vehicle (ماشین) specific fields
	const [chassisNumber, setChassisNumber] = useState('')
	const [brandAndModel, setBrandAndModel] = useState('')
	const [modelYear, setModelYear] = useState('2024')
	const [color, setColor] = useState('')
	const [valueUsd, setValueUsd] = useState<number>(45000)

	const isVehicleCategory = categoryName === 'ماشین' || categoryName === 'خودرو'

	const handleCreateProduct = (e: React.FormEvent) => {
		e.preventDefault()
		const comp = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!

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

		const newProd: Product = {
			id: `prod_${Date.now()}`,
			code: code || `PRD-100${products.length + 1}`,
			name,
			categoryId: isVehicleCategory ? 'cat_auto' : 'cat_general',
			categoryName,
			companyId: comp.id,
			companyName: comp.name,
			unit: isVehicleCategory ? 'device' : 'ton',
			storageType,
			isDangerous,
			isValuable: isVehicleCategory ? true : isValuable,
			estimatedValueRial: isVehicleCategory && vehicleSpecs ? vehicleSpecs.valueUsd * 600000000 : valueToman * 10,
			vehicleSpecs,
			currentStockTotal: 1,
		}

		setProducts([newProd, ...products])
		setIsNewProductModalOpen(false)
		setName('')
		setCode('')
		setChassisNumber('')
		setBrandAndModel('')
		setColor('')
	}

	const filteredProducts = products.filter((p) => {
		const matchSearch =
			p.name.includes(searchTerm) ||
			p.code.includes(searchTerm) ||
			p.companyName.includes(searchTerm) ||
			(p.vehicleSpecs?.chassisNumber && p.vehicleSpecs.chassisNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(p.vehicleSpecs?.brandAndModel && p.vehicleSpecs.brandAndModel.includes(searchTerm))

		if (categoryFilter === 'all') return matchSearch
		if (categoryFilter === 'vehicle') return matchSearch && (p.categoryName === 'ماشین' || !!p.vehicleSpecs)
		if (categoryFilter === 'others') return matchSearch && p.categoryName !== 'ماشین' && !p.vehicleSpecs
		return matchSearch
	})

	return (
		<AppLayout title="مدیریت کالاها و محموله‌ها">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">کاتالوگ کالاها و محموله‌ها</h1>
					<p className="text-sm text-slate-500 mt-1">
						تعریف کالاها و خودروها (با شماره شاسی، برند، سال مدل، رنگ و قیمت دلاری)
					</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoAddOutline className="w-4 h-4" />}
					onClick={() => setIsNewProductModalOpen(true)}
				>
					تعریف کالا / خودرو جدید
				</Button>
			</div>

			{/* Filter & Search Bar */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجو بر اساس نام کالا، شماره شاسی، برند، کد یا شرکت مالک..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
					<div className="flex gap-2 w-full sm:w-auto">
						<Button
							variant={categoryFilter === 'all' ? 'filled' : 'outlined'}
							size="sm"
							onClick={() => setCategoryFilter('all')}
						>
							همه کالاها ({toPersianDigits(products.length)})
						</Button>
						<Button
							variant={categoryFilter === 'vehicle' ? 'filled' : 'outlined'}
							size="sm"
							icon={<IoCarSportOutline className="w-3.5 h-3.5" />}
							onClick={() => setCategoryFilter('vehicle')}
						>
							دسته‌بندی ماشین ({toPersianDigits(products.filter((p) => p.categoryName === 'ماشین' || !!p.vehicleSpecs).length)})
						</Button>
						<Button
							variant={categoryFilter === 'others' ? 'filled' : 'outlined'}
							size="sm"
							onClick={() => setCategoryFilter('others')}
						>
							سایر کالاها
						</Button>
					</div>
				</div>
			</Card>

			{/* Products Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>کد کالا</TableHead>
							<TableHead>نام کالا / خودرو</TableHead>
							<TableHead>دسته‌بندی</TableHead>
							<TableHead>مشخصات خودرویی (شاسی / برند / رنگ)</TableHead>
							<TableHead>شرکت مالک</TableHead>
							<TableHead>ارزش تخمینی</TableHead>
							<TableHead>موجودی</TableHead>
							<TableHead>نوع نگهداری</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredProducts.map((p) => {
							const isCar = p.categoryName === 'ماشین' || !!p.vehicleSpecs

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
											<Badge variant="primary">ماشین</Badge>
										) : (
											<span className="text-xs text-slate-600 font-medium">{p.categoryName}</span>
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
											<span className="text-slate-400 text-xs">-</span>
										)}
									</TableCell>
									<TableCell className="font-semibold text-slate-800 max-w-[140px] truncate">
										{p.companyName}
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
									<TableCell className="font-black text-slate-900">
										{toPersianDigits(p.currentStockTotal)} {p.unit === 'device' ? 'دستگاه' : 'تن'}
									</TableCell>
									<TableCell>
										{p.storageType === 'normal' && <Badge variant="neutral">عادی</Badge>}
										{p.storageType === 'dangerous' && <Badge variant="error">خطرناک (ایزوله)</Badge>}
										{p.storageType === 'valuable' && <Badge variant="warning">ارزشمند / حساس</Badge>}
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
				title="تعریف کالا / ثبت خودرو در سامانه"
				maxWidth="lg"
			>
				<form onSubmit={handleCreateProduct} className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<Select
							label="دسته‌بندی کالا"
							value={categoryName}
							onChange={(e) => {
								const val = e.target.value
								setCategoryName(val)
								if (val === 'ماشین') {
									setStorageType('valuable')
									setIsValuable(true)
								}
							}}
							options={[
								{ value: 'ماشین', label: 'ماشین (خودرو سواری / سنگین)' },
								{ value: 'فلزات و فولاد', label: 'فلزات و فولاد' },
								{ value: 'غلات و کشاورزی', label: 'غلات و کشاورزی' },
								{ value: 'پتروشیمی و پلیمری', label: 'پتروشیمی و پلیمری' },
								{ value: 'مصالح ساختمانی', label: 'مصالح ساختمانی' },
								{ value: 'سایر کالاها', label: 'سایر کالاها' },
							]}
						/>
						<Select
							label="شرکت مالک کالا / متقاضی"
							value={selectedCompanyId}
							onChange={(e) => setSelectedCompanyId(e.target.value)}
							options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Input
							label="کد کالا / پارت‌نامبر"
							placeholder="PRD-..."
							value={code}
							onChange={(e) => setCode(e.target.value)}
						/>
						<Input
							label={isVehicleCategory ? 'عنوان ماشین' : 'نام کامل کالا'}
							required
							placeholder={isVehicleCategory ? 'مثال: لکسوس LX600 مدل 2024' : 'نام کالا'}
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					{/* Specific Fields for "ماشین" Category */}
					{isVehicleCategory && (
						<div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
							<div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 border-b border-blue-200 pb-2">
								<IoCarSportOutline className="w-4 h-4 text-blue-700" />
								<span>مشخصات اختصاصی ماشین (شناسه و ارزش)</span>
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

					<div className="grid grid-cols-2 gap-3">
						<Select
							label="شرایط نگهداری در انبار"
							value={storageType}
							onChange={(e) => setStorageType(e.target.value as ProductStorageType)}
							options={[
								{ value: 'valuable', label: 'ارزشمند / حساس (پارکینگ مسقف)' },
								{ value: 'normal', label: 'عادی' },
								{ value: 'dangerous', label: 'خطرناک / شیمیایی' },
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

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewProductModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm">
							{isVehicleCategory ? 'ثبت ماشین در کاتالوگ' : 'ثبت کالا'}
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}

