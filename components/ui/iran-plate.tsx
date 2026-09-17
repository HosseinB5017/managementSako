import React from 'react'
import { toEnglishDigits, toPersianDigits, cn } from '@/lib/utils/formatters'

export const IRANIAN_PLATE_LETTERS = [
	{ value: '', label: 'انتخاب حرف' },
	{ value: 'ع', label: 'ع (عمومی / کامیون و تریلی)' },
	{ value: 'الف', label: 'الف (دولتی)' },
	{ value: 'ب', label: 'ب' },
	{ value: 'پ', label: 'پ (پلیس / انتظامی)' },
	{ value: 'ت', label: 'ت (تاکسی / حمل مسافر)' },
	{ value: 'ث', label: 'ث' },
	{ value: 'ج', label: 'ج' },
	{ value: 'چ', label: 'چ' },
	{ value: 'ح', label: 'ح' },
	{ value: 'خ', label: 'خ' },
	{ value: 'د', label: 'د' },
	{ value: 'ذ', label: 'ذ' },
	{ value: 'ر', label: 'ر' },
	{ value: 'ز', label: 'ز' },
	{ value: 'ژ', label: 'ژ (معلولین / جانبازان)' },
	{ value: 'س', label: 'س' },
	{ value: 'ش', label: 'ش' },
	{ value: 'ص', label: 'ص' },
	{ value: 'ض', label: 'ض' },
	{ value: 'ط', label: 'ط' },
	{ value: 'ظ', label: 'ظ' },
	{ value: 'غ', label: 'غ' },
	{ value: 'ف', label: 'ف' },
	{ value: 'ق', label: 'ق' },
	{ value: 'ک', label: 'ک (ادوات کشاورزی / بار)' },
	{ value: 'گ', label: 'گ (گذر موقت)' },
	{ value: 'ل', label: 'ل' },
	{ value: 'م', label: 'م' },
	{ value: 'ن', label: 'ن' },
	{ value: 'و', label: 'و' },
	{ value: 'ه', label: 'ه' },
	{ value: 'ی', label: 'ی' },
	{ value: 'custom', label: 'حرف دیگر / ورود دستی' },
]

export interface ParsedIranPlate {
	isIranian: boolean
	part1: string // 2 digits
	letter: string // 1 letter
	part2: string // 3 digits
	code: string // 2 digits
}

/**
 * تجزیه رشته پلاک به ۴ بخش استاندارد پلاک ملی ایران
 */
export function parseIranPlate(plateStr: string | undefined | null): ParsedIranPlate {
	if (!plateStr) {
		return { isIranian: false, part1: '', letter: '', part2: '', code: '' }
	}

	const raw = plateStr.trim()
	const eng = toEnglishDigits(raw)

	// Format: "12 ع 345 ایران 22" or "12-ع-345-22" or "12 ع 345 22"
	const match = eng.match(/^(\d{2})\s*[-_]?\s*([^\d\s\-_]+)\s*[-_]?\s*(\d{3})\s*(?:ایران|iran|-)?\s*(\d{2})$/i)
	if (match) {
		return {
			isIranian: true,
			part1: match[1],
			letter: match[2],
			part2: match[3],
			code: match[4],
		}
	}

	// Format with spaces only: "12 ع 345 22"
	const matchAlt = eng.match(/^(\d{2})\s+([^\d\s]+)\s+(\d{3})\s+(\d{2})$/)
	if (matchAlt) {
		return {
			isIranian: true,
			part1: matchAlt[1],
			letter: matchAlt[2],
			part2: matchAlt[3],
			code: matchAlt[4],
		}
	}

	return { isIranian: false, part1: '', letter: '', part2: '', code: '' }
}

/**
 * قالب‌بندی ۴ بخش پلاک به رشته استاندارد فارسی
 * ترتیب استاندارد: ۲ رقم - حرف - ۳ رقم - ایران ۲ رقم
 */
export function formatIranPlate(
	part1: string | undefined | null,
	letter: string | undefined | null,
	part2: string | undefined | null,
	code: string | undefined | null
): string {
	const p1 = toPersianDigits(toEnglishDigits(part1 || '').replace(/\D/g, '').slice(0, 2))
	const l = (letter || '').trim()
	const p2 = toPersianDigits(toEnglishDigits(part2 || '').replace(/\D/g, '').slice(0, 3))
	const c = toPersianDigits(toEnglishDigits(code || '').replace(/\D/g, '').slice(0, 2))

	if (!p1 && !l && !p2 && !c) return ''
	return `${p1} ${l} ${p2} ایران ${c}`.trim()
}

export interface IranPlateViewProps {
	plate?: string
	part1?: string
	letter?: string
	part2?: string
	code?: string
	nationality?: 'iranian' | 'foreign'
	size?: 'sm' | 'md' | 'lg'
	variant?: 'yellow' | 'white' | 'auto'
	className?: string
}

/**
 * کامپوننت نمایش گرافیکی پلاک ملی ایران و پلاک خارجی/ترانزیت
 */
export const IranPlateView: React.FC<IranPlateViewProps> = ({
	plate,
	part1: propPart1,
	letter: propLetter,
	part2: propPart2,
	code: propCode,
	nationality,
	size = 'md',
	variant = 'auto',
	className,
}) => {
	let isIranian = nationality !== 'foreign'
	let part1 = propPart1 || ''
	let letter = propLetter || ''
	let part2 = propPart2 || ''
	let code = propCode || ''

	if (plate && (!part1 || !letter || !part2 || !code)) {
		const parsed = parseIranPlate(plate)
		if (parsed.isIranian) {
			isIranian = true
			part1 = part1 || parsed.part1
			letter = letter || parsed.letter
			part2 = part2 || parsed.part2
			code = code || parsed.code
		} else if (nationality !== 'iranian') {
			isIranian = false
		}
	}

	// پلاک خارجی / ترانزیت
	if (!isIranian) {
		const displayPlate = plate || `${part1} ${letter} ${part2} ${code}`.trim() || '---'
		return (
			<div
				dir="ltr"
				className={cn(
					'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-white font-mono font-bold border border-slate-700 shadow-xs select-none',
					size === 'sm' ? 'text-[11px] py-0.5 px-2' : size === 'lg' ? 'text-sm py-1.5 px-3' : 'text-xs',
					className
				)}
			>
				<span className="text-[10px] px-1 py-0.2 bg-amber-400 text-slate-900 rounded font-black">TR</span>
				<span>{displayPlate}</span>
			</div>
		)
	}

	// تم رنگی پلاک (زرد برای ناوگان عمومی/کامیون و سفید برای سواری)
	const isYellow = variant === 'yellow' || (variant === 'auto' && (letter === 'ع' || letter === 'ت' || letter === 'ک'))
	const bgClass = isYellow ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-900'

	// تنظیم ابعاد بر اساس سایز
	const sizeStyles = {
		sm: {
			wrapper: 'h-7 text-xs',
			flag: 'w-2.5 h-1.5',
			irBox: 'px-1 text-[7px]',
			irText: 'text-[6px]',
			body: 'px-1.5 gap-1 text-xs',
			letter: 'text-xs font-black',
			iranBox: 'px-1 min-w-[28px]',
			iranText: 'text-[7px]',
			codeText: 'text-[11px]',
		},
		md: {
			wrapper: 'h-9 text-sm',
			flag: 'w-3.5 h-2',
			irBox: 'px-1.5 text-[8px]',
			irText: 'text-[7px]',
			body: 'px-2.5 gap-1.5 text-sm',
			letter: 'text-sm font-black',
			iranBox: 'px-1.5 min-w-[34px]',
			iranText: 'text-[8px]',
			codeText: 'text-xs',
		},
		lg: {
			wrapper: 'h-11 text-base',
			flag: 'w-4 h-2.5',
			irBox: 'px-2 text-[10px]',
			irText: 'text-[8px]',
			body: 'px-3.5 gap-2 text-base',
			letter: 'text-base font-black',
			iranBox: 'px-2.5 min-w-[42px]',
			iranText: 'text-[9px]',
			codeText: 'text-sm',
		},
	}[size]

	const p1Formatted = toPersianDigits(toEnglishDigits(part1).replace(/\D/g, '').slice(0, 2)) || '--'
	const lFormatted = letter || 'ـ'
	const p2Formatted = toPersianDigits(toEnglishDigits(part2).replace(/\D/g, '').slice(0, 3)) || '---'
	const cFormatted = toPersianDigits(toEnglishDigits(code).replace(/\D/g, '').slice(0, 2)) || '--'

	return (
		<div
			dir="ltr"
			className={cn(
				'inline-flex items-stretch rounded-md border-2 border-slate-900 font-bold shadow-xs select-none overflow-hidden transition-all',
				bgClass,
				sizeStyles.wrapper,
				className
			)}
		>
			{/* نوار آبی چپ با پرچم و IR IRAN */}
			<div className={cn('bg-blue-900 text-white flex flex-col items-center justify-between py-0.5 border-r border-slate-900', sizeStyles.irBox)}>
				<div className={cn('bg-white rounded-[1px] flex flex-col overflow-hidden border border-blue-950', sizeStyles.flag)}>
					<span className="bg-emerald-600 h-1/3 w-full block"></span>
					<span className="bg-white h-1/3 w-full block"></span>
					<span className="bg-red-600 h-1/3 w-full block"></span>
				</div>
				<div className={cn('font-mono font-black tracking-tighter text-center leading-none text-white', sizeStyles.irText)}>
					<div>I.R.</div>
					<div>IRAN</div>
				</div>
			</div>

			{/* بدنه اصلی پلاک: اول ۲ رقم، بعد حرف، بعد ۳ رقم */}
			<div className={cn('flex items-center font-black', sizeStyles.body)}>
				<span className="tracking-wider">{p1Formatted}</span>
				<span className={cn('px-1 text-center font-black', sizeStyles.letter)}>{lFormatted}</span>
				<span className="tracking-wider">{p2Formatted}</span>
			</div>

			{/* کادر راست: ایران و کد ۲ رقمی شهر */}
			<div className={cn('border-l-2 border-slate-900 flex flex-col items-center justify-center py-0.5 bg-black/5 leading-tight', sizeStyles.iranBox)}>
				<span className={cn('font-bold opacity-80 leading-none', sizeStyles.iranText)}>ایران</span>
				<span className={cn('font-black tracking-wider leading-tight', sizeStyles.codeText)}>{cFormatted}</span>
			</div>
		</div>
	)
}

export interface IranPlateInputGroupProps {
	part1: string
	onChangePart1: (val: string) => void
	letter: string
	onChangeLetter: (val: string) => void
	letterCustom?: string
	onChangeLetterCustom?: (val: string) => void
	part2: string
	onChangePart2: (val: string) => void
	code: string
	onChangeCode: (val: string) => void
	error?: string
	showPreview?: boolean
}

/**
 * کامپوننت فرم ورود ۴ بخشی پلاک ملی ایران با اعمال دقیق محدودیت طول ورودی
 */
export const IranPlateInputGroup: React.FC<IranPlateInputGroupProps> = ({
	part1,
	onChangePart1,
	letter,
	onChangeLetter,
	letterCustom,
	onChangeLetterCustom,
	part2,
	onChangePart2,
	code,
	onChangeCode,
	error,
	showPreview = true,
}) => {
	const handlePart1 = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2)
		onChangePart1(digits)
	}

	const handlePart2 = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 3)
		onChangePart2(digits)
	}

	const handleCode = (e: React.ChangeEvent<HTMLInputElement>) => {
		const digits = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 2)
		onChangeCode(digits)
	}

	const handleCustomLetter = (e: React.ChangeEvent<HTMLInputElement>) => {
		const l = e.target.value.trim().slice(0, 1)
		if (onChangeLetterCustom) onChangeLetterCustom(l)
	}

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
				{/* ورودی اول: ۲ رقم اول */}
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-slate-700">
						۲ رقم اول <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						inputMode="numeric"
						maxLength={2}
						placeholder="۱۲"
						value={toPersianDigits(part1)}
						onChange={handlePart1}
						className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
					/>
				</div>

				{/* ورودی دوم: حرف پلاک */}
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-slate-700">
						حرف پلاک <span className="text-red-500">*</span>
					</label>
					<select
						value={letter}
						onChange={(e) => onChangeLetter(e.target.value)}
						className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-2 py-2.5 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
					>
						{IRANIAN_PLATE_LETTERS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>

				{/* ورودی سوم: ۳ رقم بعدی */}
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-slate-700">
						۳ رقم بعدی <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						inputMode="numeric"
						maxLength={3}
						placeholder="۳۴۵"
						value={toPersianDigits(part2)}
						onChange={handlePart2}
						className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
					/>
				</div>

				{/* ورودی چهارم: ۲ رقم کد ایران */}
				<div className="flex flex-col gap-1">
					<label className="text-xs font-semibold text-slate-700">
						کد ایران (۲ رقم) <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						inputMode="numeric"
						maxLength={2}
						placeholder="۲۲"
						value={toPersianDigits(code)}
						onChange={handleCode}
						className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-3 py-2.5 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
			</div>

			{letter === 'custom' && (
				<div className="w-full sm:w-1/2">
					<label className="text-xs font-semibold text-slate-700">
						حرف پلاک به‌صورت دستی (یک حرف) <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						maxLength={1}
						placeholder="مثال: ع"
						value={letterCustom || ''}
						onChange={handleCustomLetter}
						className="w-full mt-1 bg-white border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-3 py-2 outline-none transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
			)}

			{error && <span className="text-xs text-red-600 font-medium block">{error}</span>}

			{showPreview && (
				<div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
					<span className="text-xs font-bold text-slate-600">پیش‌نمایش پلاک ملی:</span>
					<IranPlateView
						part1={part1}
						letter={letter === 'custom' ? letterCustom : letter}
						part2={part2}
						code={code}
						size="md"
					/>
				</div>
			)}
		</div>
	)
}
