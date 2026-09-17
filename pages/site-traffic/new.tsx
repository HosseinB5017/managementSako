import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { IranPlateView, IranPlateInputGroup, formatIranPlate } from '@/components/ui/iran-plate'
import {
	MOCK_SITE_VISITS,
	MOCK_COMPANIES,
	MOCK_VEHICLES,
	MOCK_PRODUCTS,
} from '@/lib/mock-data/logistics-mock'
import { SiteVisit, VehicleCargoItem, Vehicle, Product } from '@/lib/types/logistics'
import { formatToman, toPersianDigits, getPersianTodayDate, cn } from '@/lib/utils/formatters'
import {
	IoCarSportOutline,
	IoTrainOutline,
	IoAddOutline,
	IoCheckmarkCircleOutline,
	IoBarcodeOutline,
	IoTrashOutline,
	IoBusinessOutline,
	IoPersonOutline,
	IoCubeOutline,
	IoScaleOutline,
	IoCameraOutline,
	IoArrowBackOutline,
	IoArrowForwardOutline,
	IoCloudUploadOutline,
	IoFlameOutline,
	IoWarningOutline,
	IoCheckmarkDoneCircleOutline,
	IoCloseOutline,
	IoImageOutline,
	IoShieldCheckmarkOutline,
	IoArrowUndoOutline,
	IoInformationCircleOutline,
	IoSparklesOutline,
} from 'react-icons/io5'

const STORAGE_KEY_VISITS = 'managesako-site-visits'
const STORAGE_KEY_VEHICLES = 'managesako-vehicles'
const STORAGE_KEY_DEFINITIONS = 'managesako-product-definitions'

export type ProductParameter = {
	id: string
	name: string
	key: string
	type: 'text' | 'number' | 'select' | 'date' | 'boolean'
	required: boolean
	options: string
}

export type ProductDefinition = {
	id: string
	name: string
	code: string
	description: string
	isActive: boolean
	units: ('number' | 'ton' | 'kg')[]
	parameters: ProductParameter[]
	version: number
}

export default function NewSiteTrafficEntryPage() {
	const router = useRouter()
	const [wizardStep, setWizardStep] = useState<number>(1)

	// Local vehicles state
	const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(MOCK_VEHICLES)

	// Product definitions & dynamic parameters
	const [productDefinitions, setProductDefinitions] = useState<ProductDefinition[]>([])
	const [customParamValues, setCustomParamValues] = useState<Record<string, string>>({})

	useEffect(() => {
		try {
			const savedVehicles = window.localStorage.getItem(STORAGE_KEY_VEHICLES)
			if (savedVehicles) {
				setVehiclesList(JSON.parse(savedVehicles))
			}
		} catch {
			// ignore
		}

		try {
			const savedDefs = window.localStorage.getItem(STORAGE_KEY_DEFINITIONS)
			if (savedDefs) {
				setProductDefinitions(JSON.parse(savedDefs))
			}
		} catch {
			// ignore
		}
	}, [])

	// Step 1: نوع ناوگان (Transit vs Rail Wagon)
	const [targetType, setTargetType] = useState<'vehicle' | 'wagon'>('vehicle')

	// Step 2: مالک بار و نماینده
	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [selectedContactId, setSelectedContactId] = useState('')

	// Step 3: انتخاب یا ثبت سریع خودرو / واگن
	const [selectedVehicleId, setSelectedVehicleId] = useState('')
	const [wagonNumber, setWagonNumber] = useState('')
	const [wagonType, setWagonType] = useState('flat')
	const [wagonCapacity, setWagonCapacity] = useState('60')
	const [driverName, setDriverName] = useState('')
	const [driverPhone, setDriverPhone] = useState('')
	const [vehiclePlateString, setVehiclePlateString] = useState('')

	// Sub-modal for quick vehicle registration in Step 3
	const [isQuickVehicleModalOpen, setIsQuickVehicleModalOpen] = useState(false)
	const [quickPlateType, setQuickPlateType] = useState<'iranian' | 'foreign'>('iranian')
	const [quickPart1, setQuickPart1] = useState('')
	const [quickLetter, setQuickLetter] = useState('ع')
	const [quickLetterCustom, setQuickLetterCustom] = useState('')
	const [quickPart2, setQuickPart2] = useState('')
	const [quickCode, setQuickCode] = useState('')
	const [quickForeignPlate, setQuickForeignPlate] = useState('')
	const [quickDriverName, setQuickDriverName] = useState('')
	const [quickDriverPhone, setQuickDriverPhone] = useState('')
	const [quickVehicleType, setQuickVehicleType] = useState<Vehicle['type']>('trailer')
	const [quickCapacityTon, setQuickCapacityTon] = useState('25')

	// Step 4: مشخصات و ثبت کالا
	const [cargoDangerType, setCargoDangerType] = useState<'normal' | 'dangerous' | 'heavy' | 'valuable'>('normal')
	const [selectedProductId, setSelectedProductId] = useState('')
	const [productCode, setProductCode] = useState('')
	const [productName, setProductName] = useState('')
	const [productCategory, setProductCategory] = useState('عمومی')
	const [productUnit, setProductUnit] = useState('ton')
	const [cargoTonnage, setCargoTonnage] = useState('24')
	const [estimatedValueToman, setEstimatedValueToman] = useState('150000000')
	const [isCarCarrier, setIsCarCarrier] = useState(false)
	const [manifestCars, setManifestCars] = useState<
		{ chassisNumber: string; brandAndModel: string; modelYear: string; color: string; valueUsd: number; destination: 'warehouse' | 'daily_exit' }[]
	>([
		{ chassisNumber: '', brandAndModel: 'تویوتا لندکروزر', modelYear: '2024', color: 'سفید', valueUsd: 85000, destination: 'warehouse' },
	])

	// Matched dynamic definition parameters (from /products/definitions)
	const activeDefinition = useMemo(() => {
		if (!productCategory && !productName && !productCode) return null
		return (
			productDefinitions.find(
				(d) =>
					d.code.toLowerCase() === productCode.toLowerCase() ||
					d.name.toLowerCase() === productCategory.toLowerCase() ||
					d.name.toLowerCase() === productName.toLowerCase()
			) || null
		)
	}, [productDefinitions, productCategory, productName, productCode])

	// Step 5: اطلاعات ورود، زمان، باسکول و موقعیت
	const [entryDateTime, setEntryDateTime] = useState(`${getPersianTodayDate()} ۱۰:۳۰`)
	const [operationType, setOperationType] = useState<any>('unloading')
	const [hasWeighing, setHasWeighing] = useState(true)
	const [weighingSlipNumber, setWeighingSlipNumber] = useState('WGH-94021')
	const [grossWeightTon, setGrossWeightTon] = useState('38.5')
	const [tareWeightTon, setTareWeightTon] = useState('14.2')
	const [parkingLocation, setParkingLocation] = useState('سکوی تخلیه و بارگیری شماره ۲')

	// Step 6: شواهد ورود (عکس و فیلم - اختیاری)
	const [evidenceFiles, setEvidenceFiles] = useState<{ id: string; name: string; type: 'image' | 'video' }[]>([
		{ id: 'ev_1', name: 'عکس_پلاک_و_کابین.jpg', type: 'image' },
	])
	const [evidenceNote, setEvidenceNote] = useState('')

	// Step 7: بازبینی و تیکت تایید
	const [isConfirmedByInspector, setIsConfirmedByInspector] = useState(true)
	const [inspectorNotes, setInspectorNotes] = useState('بار و مدارک با بازرسی فیزیکی مطابقت داده شد.')

	// Company and Contacts helpers
	const currentCompany = useMemo(() => {
		return MOCK_COMPANIES.find((c) => c.id === selectedCompanyId) || MOCK_COMPANIES[0]
	}, [selectedCompanyId])

	const availableContacts = useMemo(() => {
		return currentCompany?.contacts || []
	}, [currentCompany])

	const availableVehicles = useMemo(() => {
		return vehiclesList.filter((v) => !v.companyId || v.companyId === selectedCompanyId)
	}, [vehiclesList, selectedCompanyId])

	// Handle company change
	const handleCompanyChange = (compId: string) => {
		setSelectedCompanyId(compId)
		const comp = MOCK_COMPANIES.find((c) => c.id === compId)
		if (comp && comp.contacts.length > 0) {
			setSelectedContactId(comp.contacts[0].id)
		} else {
			setSelectedContactId('')
		}
	}

	// Handle vehicle selection
	const handleVehicleSelect = (vId: string) => {
		setSelectedVehicleId(vId)
		const found = vehiclesList.find((v) => v.id === vId)
		if (found) {
			setVehiclePlateString(found.plateNumber)
			setDriverName(found.driverName)
			setDriverPhone(found.driverPhone)
		}
	}

	// Quick save vehicle from submodal
	const handleSaveQuickVehicle = (e: React.FormEvent) => {
		e.preventDefault()
		let plate = quickForeignPlate
		if (quickPlateType === 'iranian') {
			plate = formatIranPlate(
				quickPart1,
				quickLetter === 'custom' ? quickLetterCustom : quickLetter,
				quickPart2,
				quickCode
			)
		}

		if (!plate.trim()) {
			alert('لطفاً شماره پلاک را وارد کنید.')
			return
		}

		const newVeh: Vehicle = {
			id: `veh_quick_${Date.now()}`,
			plateNumber: plate,
			driverName: quickDriverName || 'بدون راننده',
			driverPhone: quickDriverPhone || '09120000000',
			companyId: selectedCompanyId,
			companyName: currentCompany.name,
			type: quickVehicleType,
			capacityTon: Number(quickCapacityTon) || 25,
			country: quickPlateType === 'iranian' ? 'ایران' : 'ترانزیت خارجی',
			isInsideSite: true,
			createdAt: getPersianTodayDate(),
		}

		const updatedVehicles = [newVeh, ...vehiclesList]
		setVehiclesList(updatedVehicles)
		try {
			window.localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(updatedVehicles))
		} catch {
			// ignore
		}

		setSelectedVehicleId(newVeh.id)
		setVehiclePlateString(newVeh.plateNumber)
		setDriverName(newVeh.driverName)
		setDriverPhone(newVeh.driverPhone)
		setIsQuickVehicleModalOpen(false)

		// Reset quick inputs
		setQuickPart1('')
		setQuickPart2('')
		setQuickCode('')
		setQuickForeignPlate('')
		setQuickDriverName('')
		setQuickDriverPhone('')
	}

	// Product selection handler - Exact matching and loading full specifications
	const handleProductSelect = (pId: string) => {
		setSelectedProductId(pId)
		const prod = MOCK_PRODUCTS.find((p) => p.id === pId)
		if (prod) {
			setProductCode(prod.code)
			setProductName(prod.name)
			setProductCategory(prod.categoryName)
			setProductUnit(prod.unit)

			// Load Estimated Value
			if (prod.estimatedValueRial) {
				setEstimatedValueToman((prod.estimatedValueRial / 10).toString())
			}

			// Load Storage and Danger Attributes
			if (prod.storageType === 'dangerous' || prod.isDangerous) {
				setCargoDangerType('dangerous')
			} else if (prod.storageType === 'valuable' || prod.isValuable) {
				setCargoDangerType('valuable')
			} else {
				setCargoDangerType('normal')
			}

			// If vehicle category or vehicle specs are present
			if (prod.categoryName === 'ماشین' || prod.vehicleSpecs) {
				setIsCarCarrier(true)
				if (prod.vehicleSpecs) {
					setManifestCars([
						{
							chassisNumber: prod.vehicleSpecs.chassisNumber || '',
							brandAndModel: prod.vehicleSpecs.brandAndModel || prod.name,
							modelYear: String(prod.vehicleSpecs.modelYear || '2024'),
							color: prod.vehicleSpecs.color || 'مشکی',
							valueUsd: prod.vehicleSpecs.valueUsd || 50000,
							destination: 'warehouse',
						},
					])
				}
			}

			// Auto populate dynamic parameters if matched with definition
			const matchedDef = productDefinitions.find(
				(d) =>
					d.code.toLowerCase() === prod.code.toLowerCase() ||
					d.name.toLowerCase() === prod.categoryName.toLowerCase() ||
					d.name.toLowerCase() === prod.name.toLowerCase()
			)

			if (matchedDef) {
				const initialValues: Record<string, string> = {}
				matchedDef.parameters.forEach((param) => {
					if (prod.vehicleSpecs && param.key === 'chassisNumber') {
						initialValues[param.key] = prod.vehicleSpecs.chassisNumber
					} else if (prod.vehicleSpecs && param.key === 'brandAndModel') {
						initialValues[param.key] = prod.vehicleSpecs.brandAndModel
					} else if (prod.vehicleSpecs && param.key === 'modelYear') {
						initialValues[param.key] = String(prod.vehicleSpecs.modelYear)
					} else if (prod.vehicleSpecs && param.key === 'color') {
						initialValues[param.key] = prod.vehicleSpecs.color
					} else {
						initialValues[param.key] = ''
					}
				})
				setCustomParamValues(initialValues)
			}
		}
	}

	// Manifest rows handler
	const handleAddCarRow = () => {
		setManifestCars([
			...manifestCars,
			{ chassisNumber: '', brandAndModel: productName || '', modelYear: '2024', color: 'مشکی', valueUsd: 50000, destination: 'warehouse' },
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

	// Evidence mock upload
	const handleAddMockFile = (type: 'image' | 'video') => {
		const newFile = {
			id: `ev_${Date.now()}`,
			name: type === 'image' ? `تصویر_سند_بارنامه_${Date.now().toString().slice(-4)}.jpg` : `ویدیو_بازرسی_گیت_${Date.now().toString().slice(-4)}.mp4`,
			type,
		}
		setEvidenceFiles([...evidenceFiles, newFile])
	}

	const handleRemoveEvidence = (id: string) => {
		setEvidenceFiles(evidenceFiles.filter((f) => f.id !== id))
	}

	// Submit entire 7-step wizard entry
	const handleFinalSubmitVisit = (e: React.FormEvent) => {
		e.preventDefault()

		let finalPlate = vehiclePlateString
		let genManifest: VehicleCargoItem[] | undefined = undefined

		if (isCarCarrier && manifestCars.length > 0) {
			genManifest = manifestCars
				.filter((c) => c.chassisNumber.trim().length > 0)
				.map((c, i) => ({
					id: `v_manifest_${Date.now()}_${i}`,
					chassisNumber: c.chassisNumber.trim().toUpperCase(),
					brandAndModel: c.brandAndModel || 'خودرو سواری',
					modelYear: c.modelYear,
					color: c.color,
					valueUsd: c.valueUsd,
					companyId: currentCompany.id,
					companyName: currentCompany.name,
					warehouseName: c.destination === 'warehouse' ? 'پارکینگ خودروهای انبار' : 'ترانزیت خروج روزانه',
					locationCode: c.destination === 'warehouse' ? `PARK-${i + 10}` : 'خروجی سریع',
					entryDate: getPersianTodayDate(),
					status: c.destination === 'warehouse' ? 'in_stock' : 'dispatched',
					notes: c.destination === 'warehouse' ? 'ورود مستقیم به انبار' : 'ترخیص و خروج در همان روز',
				}))
		}

		const netWeight = (Number(grossWeightTon) || 0) - (Number(tareWeightTon) || 0)

		const newVisit: SiteVisit = {
			id: `vis_${Date.now()}`,
			trackingCode: `VIS-405-0${Date.now().toString().slice(-3)}`,
			targetType,
			vehicleId: targetType === 'vehicle' ? selectedVehicleId : undefined,
			vehiclePlate: targetType === 'vehicle' ? finalPlate : undefined,
			wagonNumber: targetType === 'wagon' ? wagonNumber : undefined,
			driverName: targetType === 'vehicle' ? driverName : undefined,
			driverPhone: targetType === 'vehicle' ? driverPhone : undefined,
			companyId: currentCompany.id,
			companyName: currentCompany.name,
			cargoType: isCarCarrier ? 'vehicles' : 'general',
			vehicleManifest: genManifest,
			entryDateTime: entryDateTime || `${getPersianTodayDate()} ۱۰:۱۵`,
			operationType,
			parkingLocation,
			entranceFeeCalculated: targetType === 'vehicle' ? 8000000 : 35000000,
			overnightFeeCalculated: 0,
			status: 'inside',
			notes: `${productName ? `کالا: ${productName}` : ''}${isCarCarrier ? ` | حامل ${toPersianDigits(genManifest?.length || 0)} دستگاه خودرو` : ''}${hasWeighing ? ` | وزن خالص باسکول: ${toPersianDigits(netWeight.toFixed(2))} تن` : ''}`,
		}

		// Save to localStorage
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY_VISITS)
			const currentVisits = saved ? JSON.parse(saved) : MOCK_SITE_VISITS
			window.localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify([newVisit, ...currentVisits]))
		} catch {
			// ignore
		}

		alert('پذیرش ناوگان و کالا با موفقیت ثبت شد و تیکت ورود صادر گردید.')
		router.push('/site-traffic')
	}

	const wizardStepTitles = [
		{ step: 1, title: 'نوع ناوگان', icon: IoCarSportOutline },
		{ step: 2, title: 'مالک بار و نماینده', icon: IoBusinessOutline },
		{ step: 3, title: 'انتخاب خودرو / واگن', icon: IoCarSportOutline },
		{ step: 4, title: 'مشخصات و ثبت کالا', icon: IoCubeOutline },
		{ step: 5, title: 'اطلاعات ورود و باسکول', icon: IoScaleOutline },
		{ step: 6, title: 'شواهد ورود (اختیاری)', icon: IoCameraOutline },
		{ step: 7, title: 'بازبینی و صدور تیکت', icon: IoShieldCheckmarkOutline },
	]

	return (
		<AppLayout title="ثبت و پذیرش ورود ناوگان به سایت">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-right" dir="rtl">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">فرم ۷ مرحله‌ای پذیرش و ثبت ورود ناوگان و کالا به سایت</h1>
					<p className="text-sm text-slate-500 mt-1">
						ثبت دقیق و گام‌به‌گام اطلاعات تردد، ناوگان، مالک، کالا، باسکول، شواهد تصویری و صدور نهایی تیکت ورود
					</p>
				</div>
				<Button
					variant="outlined"
					size="sm"
					icon={<IoArrowUndoOutline className="w-4 h-4" />}
					onClick={() => router.push('/site-traffic')}
				>
					بازگشت به لیست ترددها
				</Button>
			</div>

			{/* Multi-Step Wizard Container */}
			<div className="space-y-6 max-w-5xl mx-auto text-right" dir="rtl">
				{/* Progress Stepper Bar */}
				<Card>
					<div className="p-2 overflow-x-auto">
						<div className="flex items-center justify-between min-w-[620px] gap-2">
							{wizardStepTitles.map((st, idx) => {
								const Icon = st.icon
								const isCurrent = wizardStep === st.step
								const isPassed = wizardStep > st.step

								return (
									<React.Fragment key={st.step}>
										<button
											type="button"
											onClick={() => {
												if (isPassed) setWizardStep(st.step)
											}}
											className={cn(
												'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0',
												isCurrent
													? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-102'
													: isPassed
													? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
													: 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
											)}
										>
											<span
												className={cn(
													'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black',
													isCurrent ? 'bg-white text-blue-600' : isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
												)}
											>
												{isPassed ? '✓' : toPersianDigits(st.step)}
											</span>
											<span>{st.title}</span>
										</button>
										{idx < wizardStepTitles.length - 1 && (
											<div className={cn('h-0.5 w-6 rounded-full shrink-0', isPassed ? 'bg-emerald-500' : 'bg-slate-200')} />
										)}
									</React.Fragment>
								)
							})}
						</div>
					</div>
				</Card>

				{/* Wizard Body Card */}
				<Card className="p-6">
					{/* Step 1: نوع ناوگان */}
					{wizardStep === 1 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4">
								<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
									<IoCarSportOutline className="w-6 h-6 text-blue-600" />
									مرحله ۱: انتخاب نوع ناوگان ورودی به سایت
								</h3>
								<p className="text-xs text-slate-500 mt-1">مشخص نمایید وسیله نقلیه ترانزیت جاده‌ای است یا واگن باری ریلی.</p>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
								<div
									onClick={() => setTargetType('vehicle')}
									className={cn(
										'p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4',
										targetType === 'vehicle'
											? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-100'
											: 'border-slate-200 hover:border-slate-300 bg-white'
									)}
								>
									<div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-3xl', targetType === 'vehicle' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600')}>
										<IoCarSportOutline className="w-8 h-8" />
									</div>
									<div>
										<h4 className="font-black text-slate-900 text-base">تریلی / کامیون ترانزیت جاده‌ای</h4>
										<p className="text-xs text-slate-500 mt-2 leading-relaxed">
											ناوگان حمل جاده‌ای، تریلی خودروبر، کامیون ده چرخ، ترانزیت ایرانی یا خارجی بین‌المللی
										</p>
									</div>
									<Badge variant={targetType === 'vehicle' ? 'primary' : 'neutral'} className="px-4 py-1 text-xs">
										{targetType === 'vehicle' ? 'انتخاب شده ✓' : 'انتخاب ناوگان جاده‌ای'}
									</Badge>
								</div>

								<div
									onClick={() => setTargetType('wagon')}
									className={cn(
										'p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4',
										targetType === 'wagon'
											? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-100'
											: 'border-slate-200 hover:border-slate-300 bg-white'
									)}
								>
									<div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-3xl', targetType === 'wagon' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600')}>
										<IoTrainOutline className="w-8 h-8" />
									</div>
									<div>
										<h4 className="font-black text-slate-900 text-base">واگن باری ریلی</h4>
										<p className="text-xs text-slate-500 mt-2 leading-relaxed">
											قطار باری شبکه راه‌آهن، واگن مسطح، لبه‌دار، مخزن‌دار یا واگن‌های دو طبقه حمل خودرو
										</p>
									</div>
									<Badge variant={targetType === 'wagon' ? 'primary' : 'neutral'} className="px-4 py-1 text-xs">
										{targetType === 'wagon' ? 'انتخاب شده ✓' : 'انتخاب ناوگان ریلی'}
									</Badge>
								</div>
							</div>
						</div>
					)}

					{/* Step 2: مالک بار و نماینده */}
					{wizardStep === 2 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4">
								<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
									<IoBusinessOutline className="w-6 h-6 text-blue-600" />
									مرحله ۲: انتخاب مالک بار و نماینده رسمی
								</h3>
								<p className="text-xs text-slate-500 mt-1">شرکت تجاری صاحب محموله و نماینده مسئول حاضر در سکو را مشخص کنید.</p>
							</div>

							<div className="space-y-5 max-w-3xl">
								<div>
									<Select
										label="شرکت مالک بار / صاحب کالا"
										value={selectedCompanyId}
										onChange={(e) => handleCompanyChange(e.target.value)}
										options={MOCK_COMPANIES.map((c) => ({
											value: c.id,
											label: `${c.name} (${c.type === 'legal' ? 'حقوقی' : 'حقیقی'})`,
										}))}
									/>
									<p className="text-xs text-slate-500 mt-1.5 font-mono">
										شناسه ملی: {currentCompany.nationalId} | کد اقتصادی: {currentCompany.economicCode || '---'} | تلفن: {currentCompany.phone}
									</p>
								</div>

								<div>
									<label className="block text-xs font-bold text-slate-700 mb-1.5">
										نماینده یا رابط رسمی شرکت در سکو
									</label>
									{availableContacts.length > 0 ? (
										<select
											value={selectedContactId}
											onChange={(e) => setSelectedContactId(e.target.value)}
											className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-medium rounded-xl px-3 py-2.5 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
										>
											<option value="">-- انتخاب نماینده شرکت --</option>
											{availableContacts.map((cnt) => (
												<option key={cnt.id} value={cnt.id}>
													{cnt.fullName} - {cnt.position} (موبایل: {toPersianDigits(cnt.mobile)})
												</option>
											))}
										</select>
									) : (
										<div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
											نماینده‌ای برای این شرکت ثبت نشده است. می‌توانید در بخش مخاطبان شرکت نماینده ثبت کنید.
										</div>
									)}
								</div>

								{/* Info Box */}
								<div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3">
									<IoPersonOutline className="w-6 h-6 text-blue-700 shrink-0 mt-0.5" />
									<div className="text-xs text-blue-900 space-y-1.5 leading-relaxed">
										<p className="font-bold text-sm">وضعیت حساب و قرارداد شرکت:</p>
										<p>
											مانده حساب فعلی: <span className="font-bold font-mono">{toPersianDigits(formatToman(currentCompany.totalBalance))}</span>
											{' '}| وضعیت قرارداد: {currentCompany.contracts.length > 0 ? 'دارای قرارداد معتبر فعال (شامل تخفیف)' : 'تعرفه عمومی آزاد'}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Step 3: انتخاب یا ثبت سریع خودرو / واگن */}
					{wizardStep === 3 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div>
									<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
										<IoCarSportOutline className="w-6 h-6 text-blue-600" />
										مرحله ۳: {targetType === 'vehicle' ? 'انتخاب یا ثبت سریع خودرو / تریلی' : 'مشخصات واگن باری ریلی'}
									</h3>
									<p className="text-xs text-slate-500 mt-1">
										{targetType === 'vehicle'
											? 'خودرو را از ناوگان ثبت‌شده انتخاب کنید یا به صورت سریع پلاک و مشخصات آن را ثبت نمایید.'
											: 'شماره و مشخصات فنی واگن باری را وارد کنید.'}
									</p>
								</div>
								{targetType === 'vehicle' && (
									<Button
										type="button"
										variant="filled"
										size="sm"
										icon={<IoAddOutline className="w-4 h-4" />}
										onClick={() => setIsQuickVehicleModalOpen(true)}
										className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
									>
										ثبت سریع خودرو / تریلی
									</Button>
								)}
							</div>

							{targetType === 'vehicle' ? (
								<div className="space-y-5 max-w-3xl">
									<div>
										<Select
											label="انتخاب وسیله نقلیه از لیست ناوگان"
											value={selectedVehicleId}
											onChange={(e) => handleVehicleSelect(e.target.value)}
											options={[
												{ value: '', label: '-- انتخاب از میان خودروهای ثبت‌شده --' },
												...availableVehicles.map((v) => ({
													value: v.id,
													label: `${v.plateNumber} | ${v.driverName} | ظرفیت: ${toPersianDigits(v.capacityTon)} تن`,
												})),
											]}
										/>
									</div>

									{selectedVehicleId ? (
										<div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-xs font-bold text-slate-500">پلاک شناسایی خودرو:</span>
												<IranPlateView plate={vehiclePlateString} size="md" />
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
												<Input
													label="نام راننده"
													value={driverName}
													onChange={(e) => setDriverName(e.target.value)}
												/>
												<Input
													label="شماره تماس راننده"
													value={driverPhone}
													onChange={(e) => setDriverPhone(e.target.value)}
												/>
											</div>
										</div>
									) : (
										<div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3">
											<IoCarSportOutline className="w-10 h-10 text-slate-400 mx-auto" />
											<p className="text-xs text-slate-600 font-medium">
												هنوز خودرویی انتخاب نشده است. از منوی کشویی انتخاب کنید یا از دکمه زیر برای ثبت سریع استفاده فرمایید.
											</p>
											<Button
												type="button"
												variant="outlined"
												size="sm"
												icon={<IoAddOutline className="w-4 h-4" />}
												onClick={() => setIsQuickVehicleModalOpen(true)}
											>
												ثبت سریع خودرو با پلاک ملی / ترانزیت
											</Button>
										</div>
									)}
								</div>
							) : (
								<div className="space-y-5 max-w-3xl">
									<Input
										label="شماره واگن ریلی"
										required
										placeholder="مثلاً WGN-880412"
										value={wagonNumber}
										onChange={(e) => setWagonNumber(e.target.value)}
									/>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<Select
											label="نوع واگن ریلی"
											value={wagonType}
											onChange={(e) => setWagonType(e.target.value)}
											options={[
												{ value: 'flat', label: 'مسطح (Flat) - مناسب کانتینر و سواری' },
												{ value: 'bordered', label: 'لبه‌دار (Bordered)' },
												{ value: 'covered', label: 'مسقف (Covered) - غلات' },
												{ value: 'tanker', label: 'مخزن‌دار (Tanker)' },
											]}
										/>
										<Input
											label="ظرفیت واگن (تن)"
											value={wagonCapacity}
											onChange={(e) => setWagonCapacity(e.target.value)}
										/>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Step 4: مشخصات و ثبت کالا - کاملاً متصل به تعاریف و پارامترها */}
					{wizardStep === 4 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4">
								<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
									<IoCubeOutline className="w-6 h-6 text-blue-600" />
									مرحله ۴: مشخصات و ثبت کالا / محموله
								</h3>
								<p className="text-xs text-slate-500 mt-1">
									نوع ماهیت کالا را مشخص کرده و با انتخاب کالا، تمامی پارامترها و مشخصات ثبت‌شده به صورت خودکار بارگذاری خواهند شد.
								</p>
							</div>

							{/* ماهیت و حساسیت کالا */}
							<div className="space-y-2">
								<label className="block text-xs font-bold text-slate-700">نوع ماهیت و شرایط نگهداری کالا:</label>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									<button
										type="button"
										onClick={() => setCargoDangerType('normal')}
										className={cn(
											'p-3.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer',
											cargoDangerType === 'normal'
												? 'bg-blue-600 text-white border-blue-600 shadow-sm'
												: 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
										)}
									>
										<IoCubeOutline className="w-5 h-5" />
										<span>کالای عادی / عمومی</span>
									</button>
									<button
										type="button"
										onClick={() => setCargoDangerType('dangerous')}
										className={cn(
											'p-3.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer',
											cargoDangerType === 'dangerous'
												? 'bg-rose-600 text-white border-rose-600 shadow-sm'
												: 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
										)}
									>
										<IoFlameOutline className="w-5 h-5 text-rose-500" />
										<span>کالای خطرناک (ADR)</span>
									</button>
									<button
										type="button"
										onClick={() => setCargoDangerType('heavy')}
										className={cn(
											'p-3.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer',
											cargoDangerType === 'heavy'
												? 'bg-amber-600 text-white border-amber-600 shadow-sm'
												: 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
										)}
									>
										<IoWarningOutline className="w-5 h-5 text-amber-600" />
										<span>فوق‌سنگین / ترافیکی</span>
									</button>
									<button
										type="button"
										onClick={() => setCargoDangerType('valuable')}
										className={cn(
											'p-3.5 rounded-xl border-2 text-xs font-bold flex flex-col items-center gap-2 transition-all cursor-pointer',
											cargoDangerType === 'valuable'
												? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
												: 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
										)}
									>
										<IoCarSportOutline className="w-5 h-5 text-indigo-600" />
										<span>باارزش / خودرو سواری</span>
									</button>
								</div>
							</div>

							{/* انتخاب کالای تعریف شده از قبل */}
							<div className="space-y-4 pt-2 max-w-4xl">
								<div>
									<Select
										label="انتخاب کالا از کاتالوگ کالاهای تعریف‌شده"
										value={selectedProductId}
										onChange={(e) => handleProductSelect(e.target.value)}
										options={[
											{ value: '', label: '-- انتخاب کالا جهت بارگذاری مستقیم مشخصات و پارامترها --' },
											...MOCK_PRODUCTS.map((p) => ({
												value: p.id,
												label: `${p.name} [کد: ${p.code}] - دسته‌بندی: ${p.categoryName} (${p.vehicleSpecs ? 'خودرو سواری' : p.unit})`,
											})),
										]}
									/>
								</div>

								{/* مشخصات پایه کالا */}
								<div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4">
									<div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
										<IoCubeOutline className="w-4 h-4 text-blue-600" />
										<span>مشخصات عمومی کالا</span>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<Input
											label="نام کالا / محموله"
											required
											placeholder="مثلاً شمش فولادی، گندم، یا خودرو سواری"
											value={productName}
											onChange={(e) => setProductName(e.target.value)}
										/>
										<Input
											label="کد کالا / پارت نامبر"
											placeholder="PRD-..."
											value={productCode}
											onChange={(e) => setProductCode(e.target.value)}
										/>
										<Input
											label="دسته‌بندی کالا"
											value={productCategory}
											onChange={(e) => setProductCategory(e.target.value)}
										/>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<Input
											label="تناژ / مقدار کالا"
											type="number"
											value={cargoTonnage}
											onChange={(e) => setCargoTonnage(e.target.value)}
										/>
										<Select
											label="واحد اندازه‌گیری"
											value={productUnit}
											onChange={(e) => setProductUnit(e.target.value)}
											options={[
												{ value: 'ton', label: 'تن' },
												{ value: 'kg', label: 'کیلوگرم' },
												{ value: 'pallet', label: 'پالت' },
												{ value: 'number', label: 'تعداد' },
												{ value: 'device', label: 'دستگاه' },
											]}
										/>
										<Input
											label="ارزش تخمینی کل (تومان)"
											value={estimatedValueToman}
											onChange={(e) => setEstimatedValueToman(e.target.value)}
										/>
									</div>
								</div>

								{/* پارامترهای داینامیک ثبت‌شده در بخش تعاریف کالا (/products/definitions) */}
								{activeDefinition && activeDefinition.parameters.length > 0 && (
									<div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3">
										<div className="flex items-center justify-between border-b border-purple-200 pb-2">
											<div className="flex items-center gap-2 text-xs font-bold text-purple-900">
												<IoSparklesOutline className="w-4 h-4 text-purple-600" />
												<span>پارامترهای اختصاصی تعریف‌شده ({activeDefinition.name} - نسخه {activeDefinition.version})</span>
											</div>
											<Badge variant="neutral" className="text-[10px]">
												{toPersianDigits(activeDefinition.parameters.length)} پارامتر فعال
											</Badge>
										</div>

										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
											{activeDefinition.parameters.map((param) => {
												const val = customParamValues[param.key] || ''
												if (param.type === 'select' && param.options) {
													const opts = param.options.split(',').map((o) => o.trim())
													return (
														<Select
															key={param.id}
															label={`${param.name} ${param.required ? '*' : ''}`}
															value={val}
															onChange={(e) => setCustomParamValues({ ...customParamValues, [param.key]: e.target.value })}
															options={[
																{ value: '', label: `-- انتخاب ${param.name} --` },
																...opts.map((o) => ({ value: o, label: o })),
															]}
														/>
													)
												}

												if (param.type === 'boolean') {
													return (
														<div key={param.id} className="flex flex-col justify-end pb-2">
															<label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
																<input
																	type="checkbox"
																	checked={val === 'true'}
																	onChange={(e) =>
																		setCustomParamValues({
																			...customParamValues,
																			[param.key]: e.target.checked ? 'true' : 'false',
																		})
																	}
																	className="w-4 h-4 text-purple-600 rounded"
																/>
																<span>{param.name}</span>
															</label>
														</div>
													)
												}

												return (
													<Input
														key={param.id}
														label={`${param.name} ${param.required ? '*' : ''}`}
														type={param.type === 'number' ? 'number' : 'text'}
														placeholder={`ورود ${param.name}`}
														value={val}
														onChange={(e) => setCustomParamValues({ ...customParamValues, [param.key]: e.target.value })}
													/>
												)
											})}
										</div>
									</div>
								)}

								{/* Car Carrier / VIN Manifest Section */}
								<div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
									<label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900">
										<input
											type="checkbox"
											checked={isCarCarrier}
											onChange={(e) => setIsCarCarrier(e.target.checked)}
											className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
										/>
										<span>محموله خودرو سواری وارداتی است (ثبت مانیفست و شماره شاسی VIN خودروها)</span>
									</label>
								</div>

								{isCarCarrier && (
									<div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
										<div className="flex items-center justify-between border-b border-slate-200 pb-3">
											<h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
												<IoBarcodeOutline className="w-5 h-5 text-blue-600" />
												لیست خودروهای سواری داخل بار ({toPersianDigits(manifestCars.length)} دستگاه)
											</h4>
											<Button
												type="button"
												variant="outlined"
												size="sm"
												icon={<IoAddOutline className="w-4 h-4" />}
												onClick={handleAddCarRow}
											>
												افزودن ماشین
											</Button>
										</div>

										<div className="space-y-3 max-h-72 overflow-y-auto pr-1">
											{manifestCars.map((car, index) => (
												<div key={index} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
													<div className="flex items-center justify-between">
														<span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
															خودرو شماره {toPersianDigits(index + 1)}
														</span>
														{manifestCars.length > 1 && (
															<button
																type="button"
																onClick={() => handleRemoveCarRow(index)}
																className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
															>
																<IoTrashOutline className="w-4 h-4" /> حذف این خودرو
															</button>
														)}
													</div>

													<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
														<Input
															label="شماره شاسی (VIN)"
															placeholder="JTMHU..."
															required
															className="font-mono uppercase text-xs font-bold"
															value={car.chassisNumber}
															onChange={(e) => handleUpdateCarRow(index, 'chassisNumber', e.target.value)}
														/>
														<Input
															label="مدل و برند"
															placeholder="تویوتا لندکروزر..."
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
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Step 5: اطلاعات ورود، زمان، باسکول و موقعیت */}
					{wizardStep === 5 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4">
								<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
									<IoScaleOutline className="w-6 h-6 text-blue-600" />
									مرحله ۵: اطلاعات ورود، قبض باسکول و موقعیت استقرار
								</h3>
								<p className="text-xs text-slate-500 mt-1">زمان ورود به گیت، وزن کشی باسکول و لوکیشن استقرار در سکو را ثبت کنید.</p>
							</div>

							<div className="space-y-5 max-w-3xl">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<Input
										label="تاریخ و زمان ورود به گیت"
										value={entryDateTime}
										onChange={(e) => setEntryDateTime(e.target.value)}
									/>
									<Select
										label="نوع عملیات در سکو"
										value={operationType}
										onChange={(e) => setOperationType(e.target.value)}
										options={[
											{ value: 'unloading', label: 'تخلیه کالا / خودرو' },
											{ value: 'loading', label: 'بارگیری کالا / خودرو' },
											{ value: 'transshipment', label: 'ترانشیپمنت مستقیم (کامیون به واگن)' },
											{ value: 'storage', label: 'ورود مستقیم به انبار و دپو' },
										]}
									/>
								</div>

								{/* باسکول */}
								<div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
									<div className="flex items-center justify-between">
										<label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
											<input
												type="checkbox"
												checked={hasWeighing}
												onChange={(e) => setHasWeighing(e.target.checked)}
												className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
											/>
											<span>ثبت اطلاعات توزین و قبض باسکول گیت ورود</span>
										</label>
										{hasWeighing && (
											<span className="text-xs font-mono font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
												وزن خالص: {toPersianDigits(((Number(grossWeightTon) || 0) - (Number(tareWeightTon) || 0)).toFixed(2))} تن
											</span>
										)}
									</div>

									{hasWeighing && (
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
											<Input
												label="شماره قبض باسکول"
												placeholder="WGH-..."
												value={weighingSlipNumber}
												onChange={(e) => setWeighingSlipNumber(e.target.value)}
											/>
											<Input
												label="وزن ناخالص (Gross - تن)"
												type="number"
												step="0.1"
												value={grossWeightTon}
												onChange={(e) => setGrossWeightTon(e.target.value)}
											/>
											<Input
												label="وزن خالی / تار (Tare - تن)"
												type="number"
												step="0.1"
												value={tareWeightTon}
												onChange={(e) => setTareWeightTon(e.target.value)}
											/>
										</div>
									)}
								</div>

								{/* موقعیت فعلی در سایت */}
								<div>
									<Select
										label="موقعیت استقرار و تخلیه در سایت"
										value={parkingLocation}
										onChange={(e) => setParkingLocation(e.target.value)}
										options={[
											{ value: 'سکوی تخلیه و بارگیری شماره ۱', label: 'سکوی تخلیه و بارگیری شماره ۱ (لیفتراک)' },
											{ value: 'سکوی تخلیه و بارگیری شماره ۲', label: 'سکوی تخلیه و بارگیری شماره ۲ (جرثقیل سقفی)' },
											{ value: 'پارکینگ خودروهای وارداتی', label: 'پارکینگ خودروهای وارداتی (سکو C)' },
											{ value: 'انبار مرکزی سرپوشیده شماره ۱', label: 'انبار مرکزی سرپوشیده شماره ۱' },
											{ value: 'خط ۴ ریلی - سکوی الف', label: 'خط ۴ ریلی - سکوی الف' },
											{ value: 'خط ۲ ریلی - انبار غلات', label: 'خط ۲ ریلی - انبار غلات' },
										]}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Step 6: شواهد ورود (عکس و فیلم - اختیاری) */}
					{wizardStep === 6 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div>
									<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
										<IoCameraOutline className="w-6 h-6 text-blue-600" />
										مرحله ۶: شواهد و مستندات تصویری ورود (اختیاری)
									</h3>
									<p className="text-xs text-slate-500 mt-1">
										آپلود تصاویر پلاک، وضعیت فیزیکی بار، پلمپ‌ها یا ویدیوی بازرسی محموله.
									</p>
								</div>
								<div className="flex gap-2">
									<Button
										type="button"
										variant="outlined"
										size="sm"
										icon={<IoImageOutline className="w-4 h-4" />}
										onClick={() => handleAddMockFile('image')}
									>
										افزودن عکس
									</Button>
								</div>
							</div>

							<div className="max-w-3xl space-y-5">
								{/* Upload Zone */}
								<div
									onClick={() => handleAddMockFile('image')}
									className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 p-8 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
								>
									<IoCloudUploadOutline className="w-10 h-10 text-blue-600" />
									<p className="text-sm font-bold text-slate-700">عکس یا فیلم مدارک ورود را اینجا رها کنید یا کلیک نمایید</p>
									<p className="text-xs text-slate-400">فرمت‌های مجاز: JPG, PNG, MP4 (اختیاری)</p>
								</div>

								{/* Uploaded files list */}
								<div className="space-y-3">
									<span className="text-xs font-bold text-slate-700 block">فایل‌های پیوست‌شده ({toPersianDigits(evidenceFiles.length)} فایل):</span>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										{evidenceFiles.map((f) => (
											<div key={f.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
												<div className="flex items-center gap-2.5">
													<div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
														{f.type === 'image' ? <IoImageOutline className="w-5 h-5" /> : <IoCameraOutline className="w-5 h-5" />}
													</div>
													<div>
														<p className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">{f.name}</p>
														<span className="text-[10px] text-emerald-600 font-bold">پیوست شد ✓</span>
													</div>
												</div>
												<button
													type="button"
													onClick={() => handleRemoveEvidence(f.id)}
													className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
												>
													<IoCloseOutline className="w-5 h-5" />
												</button>
											</div>
										))}
									</div>
								</div>

								<Input
									label="یادداشت و مشاهدات بازرس گیت (اختیاری)"
									placeholder="مثلاً پلمپ سالم، بار بدون آسیب‌دیدگی ظاهری تحویل گرفته شد..."
									value={evidenceNote}
									onChange={(e) => setEvidenceNote(e.target.value)}
								/>
							</div>
						</div>
					)}

					{/* Step 7: بازبینی نهایی و تایید تیکت */}
					{wizardStep === 7 && (
						<div className="space-y-6 animate-in fade-in duration-200">
							<div className="border-b border-slate-100 pb-4">
								<h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
									<IoCheckmarkDoneCircleOutline className="w-6 h-6 text-emerald-600" />
									مرحله ۷: بازبینی نهایی اطلاعات و صدور تیکت ورود
								</h3>
								<p className="text-xs text-slate-500 mt-1">لطفاً خلاصه اطلاعات ثبت‌شده را بررسی کرده و تایید نهایی را انجام دهید.</p>
							</div>

							<div className="max-w-4xl space-y-5">
								{/* Summary Box */}
								<div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-200 pb-4">
										<div>
											<span className="text-slate-400 block mb-1">نوع ناوگان:</span>
											<span className="font-bold text-slate-800 text-sm">{targetType === 'vehicle' ? 'تریلی / کامیون' : 'واگن باری ریلی'}</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">پلاک / واگن:</span>
											{targetType === 'vehicle' && vehiclePlateString ? (
												<IranPlateView plate={vehiclePlateString} size="sm" />
											) : (
												<span className="font-bold font-mono text-indigo-900 text-sm">{wagonNumber || '---'}</span>
											)}
										</div>
										<div>
											<span className="text-slate-400 block mb-1">راننده / مسئول:</span>
											<span className="font-bold text-slate-800 text-sm">{driverName || 'واگن ریلی'}</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">زمان پذیرش:</span>
											<span className="font-semibold text-slate-700 font-mono">{entryDateTime}</span>
										</div>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-4">
										<div>
											<span className="text-slate-400 block mb-1">شرکت مالک بار:</span>
											<span className="font-bold text-blue-900 text-sm">{currentCompany.name}</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">نماینده حاضر:</span>
											<span className="font-bold text-slate-800">
												{availableContacts.find((c) => c.id === selectedContactId)?.fullName || 'ثبت نشده'}
											</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">نوع عملیات:</span>
											<Badge variant="primary">{operationType === 'unloading' ? 'تخلیه بار' : operationType}</Badge>
										</div>
									</div>

									<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
										<div>
											<span className="text-slate-400 block mb-1">نام کالا و ماهیت:</span>
											<span className="font-bold text-slate-800">{productName || 'کالای عمومی'} ({cargoDangerType})</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">وزن و باسکول:</span>
											<span className="font-bold text-slate-800">
												{hasWeighing
													? `${toPersianDigits(((Number(grossWeightTon) || 0) - (Number(tareWeightTon) || 0)).toFixed(2))} تن (قبض: ${weighingSlipNumber})`
													: `${toPersianDigits(cargoTonnage)} تن`}
											</span>
										</div>
										<div>
											<span className="text-slate-400 block mb-1">موقعیت استقرار:</span>
											<span className="font-semibold text-slate-800">{parkingLocation}</span>
										</div>
									</div>

									{isCarCarrier && manifestCars.length > 0 && (
										<div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
											<span className="font-bold text-blue-900">مانیفست خودروها: {toPersianDigits(manifestCars.length)} دستگاه شاسی ثبت شد</span>
											<span className="text-xs text-blue-700 font-mono font-bold">VIN Manifest Ready ✓</span>
										</div>
									)}
								</div>

								{/* Confirmation Checkbox */}
								<div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
									<label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs text-emerald-950">
										<input
											type="checkbox"
											checked={isConfirmedByInspector}
											onChange={(e) => setIsConfirmedByInspector(e.target.checked)}
											className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
										/>
										<span>صحت مشخصات ناوگان، بار و اسناد مورد تایید بازرس گیت ورودی است.</span>
									</label>
								</div>

								<Input
									label="توضیحات نهایی بازرس / متصدی ورود"
									value={inspectorNotes}
									onChange={(e) => setInspectorNotes(e.target.value)}
								/>
							</div>
						</div>
					)}

					{/* Wizard Navigation Footer */}
					<div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
						{wizardStep > 1 ? (
							<Button
								type="button"
								variant="outlined"
								icon={<IoArrowForwardOutline className="w-4 h-4" />}
								onClick={() => setWizardStep(wizardStep - 1)}
							>
								مرحله قبلی
							</Button>
						) : (
							<div />
						)}

						{wizardStep < 7 ? (
							<Button
								type="button"
								variant="filled"
								icon={<IoArrowBackOutline className="w-4 h-4" />}
								onClick={() => setWizardStep(wizardStep + 1)}
								className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
							>
								مرحله بعدی: {wizardStepTitles[wizardStep].title}
							</Button>
						) : (
							<Button
								type="button"
								variant="filled"
								icon={<IoCheckmarkCircleOutline className="w-5 h-5" />}
								onClick={handleFinalSubmitVisit}
								disabled={!isConfirmedByInspector}
								className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 shadow-sm"
							>
								ثبت نهایی و صدور قبض ورود
							</Button>
						)}
					</div>
				</Card>
			</div>

			{/* Sub-modal: Quick Vehicle Add (مرحله ۳) */}
			<Modal
				isOpen={isQuickVehicleModalOpen}
				onClose={() => setIsQuickVehicleModalOpen(false)}
				title="ثبت سریع خودرو / تریلی جدید"
				maxWidth="lg"
			>
				<form onSubmit={handleSaveQuickVehicle} className="space-y-4 text-right" dir="rtl">
					<div className="rounded-xl border border-slate-200 p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-slate-800">فرمت پلاک خودرو:</span>
							<div className="flex rounded-lg bg-slate-100 p-1">
								<button
									type="button"
									className={cn(
										'px-3 py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer',
										quickPlateType === 'iranian' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
									)}
									onClick={() => setQuickPlateType('iranian')}
								>
									پلاک ملی ایران
								</button>
								<button
									type="button"
									className={cn(
										'px-3 py-1.5 text-xs rounded-md font-bold transition-all cursor-pointer',
										quickPlateType === 'foreign' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-500'
									)}
									onClick={() => setQuickPlateType('foreign')}
								>
									ترانزیت خارجی
								</button>
							</div>
						</div>

						{quickPlateType === 'iranian' ? (
							<IranPlateInputGroup
								part1={quickPart1}
								onChangePart1={setQuickPart1}
								letter={quickLetter}
								onChangeLetter={setQuickLetter}
								letterCustom={quickLetterCustom}
								onChangeLetterCustom={setQuickLetterCustom}
								part2={quickPart2}
								onChangePart2={setQuickPart2}
								code={quickCode}
								onChangeCode={setQuickCode}
							/>
						) : (
							<Input
								label="شماره پلاک خارجی / ترانزیت"
								placeholder="مثال: 99-A-741 TR (ترکیه)"
								value={quickForeignPlate}
								onChange={(e) => setQuickForeignPlate(e.target.value)}
							/>
						)}
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Input
							label="نام راننده"
							required
							placeholder="نام و نام خانوادگی راننده"
							value={quickDriverName}
							onChange={(e) => setQuickDriverName(e.target.value)}
						/>
						<Input
							label="شماره تماس راننده"
							placeholder="0912..."
							value={quickDriverPhone}
							onChange={(e) => setQuickDriverPhone(e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Select
							label="نوع وسیله نقلیه"
							value={quickVehicleType}
							onChange={(e) => setQuickVehicleType(e.target.value as Vehicle['type'])}
							options={[
								{ value: 'trailer', label: 'تریلی ۱۸ چرخ / کفی' },
								{ value: 'truck', label: 'کامیون ده چرخ / جفت' },
								{ value: 'foreign', label: 'ترانزیت بین‌المللی' },
							]}
						/>
						<Input
							label="ظرفیت بارگیری (تن)"
							type="number"
							value={quickCapacityTon}
							onChange={(e) => setQuickCapacityTon(e.target.value)}
						/>
					</div>

					<div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsQuickVehicleModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
							ذخیره و انتخاب این خودرو
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}
