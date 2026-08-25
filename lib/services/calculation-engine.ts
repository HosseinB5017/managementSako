import {
	Company,
	Contract,
	TariffRule,
	SystemService,
	CostCalculationResult,
	ServiceUnit,
} from '@/lib/types/logistics'
import { MOCK_SERVICES, MOCK_TARIFF_RULES } from '@/lib/mock-data/logistics-mock'

export interface CalculationInput {
	serviceId: string
	company: Company
	activeContract?: Contract | null
	quantity: number // تناژ، ساعت، روز، تعداد، واگن
	isDangerous?: boolean
	isValuable?: boolean
	estimatedCargoValueRial?: number
	durationHours?: number
}

/**
 * موتور محاسبه خودکار هزینه خدمات لجستیکی
 * بر اساس سلسله‌مراتب: Service Base Price -> Contract Rule -> Company Custom Tariff -> Final Calculation
 */
export function calculateServiceCost(input: CalculationInput): CostCalculationResult {
	const {
		serviceId,
		company,
		activeContract,
		quantity,
		isDangerous = false,
		isValuable = false,
		estimatedCargoValueRial = 0,
		durationHours = 1,
	} = input

	// 1. پیدا کردن خدمت در کاتالوگ
	const service = MOCK_SERVICES.find((s) => s.id === serviceId)
	if (!service) {
		throw new Error(`سرویس با شناسه ${serviceId} یافت نشد`)
	}

	const basePrice = service.basePriceRial
	let appliedRate = basePrice
	let discountPercent = 0
	let isFree = false
	let notes: string[] = []

	// 2. بررسی قرارداد فعال
	if (activeContract && activeContract.status === 'active') {
		// بررسی خدمات رایگان قرارداد
		if (activeContract.freeServices?.includes(serviceId)) {
			isFree = true
			notes.push(`خدمت طبق قرارداد ${activeContract.contractNumber} رایگان است`)
		}

		// بررسی درصد تخفیف کلی قرارداد
		if (activeContract.discountPercentage && activeContract.discountPercentage > 0) {
			discountPercent = activeContract.discountPercentage
			notes.push(`تخفیف ${discountPercent}% قرارداد اعمال شد`)
		}
	}

	// 3. بررسی قوانین اختصاصی تعرفه (Company Tariff Rules)
	const customRule = MOCK_TARIFF_RULES.find(
		(r) => r.serviceId === serviceId && r.companyId === company.id
	)

	if (customRule) {
		if (customRule.isFree) {
			isFree = true
			notes.push('تعرفه اختصاصی شرکت: خدمت رایگان')
		} else if (customRule.customRateRial !== undefined) {
			appliedRate = customRule.customRateRial
			notes.push(`نرخ اختصاصی شرکت: ${customRule.customRateRial.toLocaleString('fa-IR')} ریال`)
		} else if (customRule.multiplier !== undefined) {
			appliedRate = basePrice * customRule.multiplier
			notes.push(`ضریب اختصاصی شرکت (${customRule.multiplier}x) اعمال شد`)
		} else if (customRule.discountPercent !== undefined) {
			discountPercent = Math.max(discountPercent, customRule.discountPercent)
			notes.push(`تخفیف اختصاصی تعرفه (${customRule.discountPercent}%) اعمال شد`)
		}
	}

	// 4. ضریب کالای خطرناک (+30%) یا ارزشمند (+20%)
	if (isDangerous) {
		appliedRate = appliedRate * 1.3
		notes.push('افزایش ۳۰٪ به دلیل محموله خطرناک')
	}

	if (isValuable) {
		appliedRate = appliedRate * 1.2
		notes.push('افزایش ۲۰٪ به دلیل محموله ارزشمند')
	}

	// 5. محاسبه مبلغ ناخالص
	let grossAmount = 0
	switch (service.unit) {
		case 'fixed':
		case 'per_operation':
		case 'per_vehicle':
		case 'per_wagon':
		case 'per_ton':
			grossAmount = quantity * appliedRate
			break
		case 'per_hour':
			grossAmount = quantity * appliedRate * durationHours
			break
		case 'per_day':
			grossAmount = quantity * appliedRate
			break
		default:
			grossAmount = quantity * appliedRate
	}

	if (isFree) {
		grossAmount = 0
	}

	// 6. محاسبه تخفیف
	const discountApplied = isFree ? 0 : Math.round((grossAmount * discountPercent) / 100)
	const netAmount = Math.max(0, grossAmount - discountApplied)

	// 7. محاسبه بیمه (اگر محموله ارزش داشته باشد - ۰.۱ درصد ارزش کالا)
	let insuranceCost = 0
	if (estimatedCargoValueRial > 0 && service.category === 'storage') {
		insuranceCost = Math.round(estimatedCargoValueRial * 0.001)
	}

	const finalCost = netAmount + insuranceCost

	const formula = isFree
		? 'رایگان بر اساس قرارداد'
		: `${quantity} ${service.unitTitleFa} × ${appliedRate.toLocaleString('fa-IR')} ریال - تخفیف ${discountPercent}% + بیمه ${insuranceCost.toLocaleString('fa-IR')} ریال = ${finalCost.toLocaleString('fa-IR')} ریال`

	return {
		serviceId: service.id,
		serviceName: service.name,
		unit: service.unit,
		quantity,
		basePrice,
		appliedRate,
		discountApplied,
		insuranceCost,
		finalCost,
		calculationFormula: formula,
	}
}
