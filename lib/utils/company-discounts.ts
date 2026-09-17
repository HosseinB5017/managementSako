const COMPANY_DISCOUNTS_KEY = 'managesako-company-invoice-discounts'

export function getCompanyInvoiceDiscount(companyId: string, fallback = 0): number {
	if (typeof window === 'undefined') return fallback

	try {
		const discounts = JSON.parse(window.localStorage.getItem(COMPANY_DISCOUNTS_KEY) || '{}') as Record<string, number>
		return typeof discounts[companyId] === 'number' ? discounts[companyId] : fallback
	} catch {
		return fallback
	}
}

export function setCompanyInvoiceDiscount(companyId: string, discountPercentage: number) {
	if (typeof window === 'undefined') return

	try {
		const discounts = JSON.parse(window.localStorage.getItem(COMPANY_DISCOUNTS_KEY) || '{}') as Record<string, number>
		discounts[companyId] = discountPercentage
		window.localStorage.setItem(COMPANY_DISCOUNTS_KEY, JSON.stringify(discounts))
	} catch {
	}
}