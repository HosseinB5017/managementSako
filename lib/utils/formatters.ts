/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toPersianDigits(n: number | string | undefined | null): string {
	if (n === undefined || n === null) return ''
	const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
	return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x, 10)])
}

/**
 * فرمت‌بندی مبالغ ریالی با جداکننده سه رقمی و پسوند تومان / ریال
 */
export function formatRial(amount: number | undefined | null, showUnit: boolean = true): string {
	if (amount === undefined || amount === null) return '۰ ریال'
	const formatted = Math.abs(amount)
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, '،')
	const sign = amount < 0 ? 'منفی ' : ''
	const result = `${sign}${toPersianDigits(formatted)}`
	return showUnit ? `${result} ریال` : result
}

export function formatToman(amountInRials: number | undefined | null): string {
	if (amountInRials === undefined || amountInRials === null) return '۰ تومان'
	const toman = Math.round(Math.abs(amountInRials) / 10)
	const formatted = toman.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '،')
	const sign = amountInRials < 0 ? 'منفی ' : ''
	return `${sign}${toPersianDigits(formatted)} تومان`
}

/**
 * فرمت‌بندی وزن به تن یا کیلوگرم
 */
export function formatWeight(ton: number | undefined | null): string {
	if (ton === undefined || ton === null) return '۰ تن'
	const formatted = ton.toLocaleString('fa-IR', { maximumFractionDigits: 2 })
	return `${formatted} تن`
}

/**
 * دریافت تاریخ امروز شمسی به فرمت رشته
 */
export function getPersianTodayDate(): string {
	try {
		const now = new Date()
		return new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(now)
	} catch {
		return '۱۴۰۵/۰۶/۰۴'
	}
}

/**
 * دریافت تاریخ و زمان کامل به شمسی
 */
export function formatPersianDateTime(isoString: string | undefined | null): string {
	if (!isoString) return '-'
	try {
		const date = new Date(isoString)
		if (isNaN(date.getTime())) return isoString // اگر خودش شمسی است
		const formatted = new Intl.DateTimeFormat('fa-IR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
		return formatted
	} catch {
		return isoString
	}
}

/**
 * تولید شناسه منحصر به فرد تصادفی
 */
export function generateId(prefix: string = 'id'): string {
	return `${prefix}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * کلاس‌های شرطی (مشابه clsx / tailwind-merge)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(' ')
}
