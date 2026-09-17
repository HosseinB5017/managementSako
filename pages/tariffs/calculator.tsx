import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { MOCK_COMPANIES, MOCK_SERVICES } from '@/lib/mock-data/logistics-mock'
import { calculateServiceCost } from '@/lib/services/calculation-engine'
import { CargoType, CostCalculationResult } from '@/lib/types/logistics'
import { formatRial, formatToman, toPersianDigits } from '@/lib/utils/formatters'
import { IoAddOutline, IoCalculatorOutline, IoDocumentTextOutline, IoPrintOutline, IoTrashOutline } from 'react-icons/io5'

type InvoiceLine = {
	id: string
	serviceId: string
	quantity: number
}

const cargoTypeOptions: { value: CargoType; label: string }[] = [
	{ value: 'normal', label: 'عادی' },
	{ value: 'heavy', label: 'سنگین' },
	{ value: 'dangerous', label: 'خطرناک' },
]

const createLine = (): InvoiceLine => ({
	id: `line_${Date.now()}_${Math.random()}`,
	serviceId: MOCK_SERVICES[0].id,
	quantity: 1,
})

export default function QuickInvoicePage() {
	const [companyId, setCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [cargoName, setCargoName] = useState('')
	const [cargoType, setCargoType] = useState<CargoType>('normal')
	const [lines, setLines] = useState<InvoiceLine[]>([createLine()])
	const [results, setResults] = useState<CostCalculationResult[]>([])
	const [isCalculated, setIsCalculated] = useState(false)
	const [documentNumber] = useState(`QR-${Date.now().toString().slice(-8)}`)

	const selectedCompany = MOCK_COMPANIES.find((company) => company.id === companyId) || MOCK_COMPANIES[0]

	const updateLine = (lineId: string, changes: Partial<InvoiceLine>) => {
		setLines((currentLines) =>
			currentLines.map((line) => (line.id === lineId ? { ...line, ...changes } : line))
		)
		setIsCalculated(false)
	}

	const handleCalculate = () => {
		if (!cargoName.trim()) return

		const activeContract = selectedCompany.contracts.find((contract) => contract.status === 'active') || null
		const calculatedResults = lines.map((line) =>
			calculateServiceCost({
				serviceId: line.serviceId,
				company: selectedCompany,
				activeContract,
				quantity: Math.max(1, line.quantity),
				cargoType,
				isDangerous: cargoType === 'dangerous',
			})
		)
		setResults(calculatedResults)
		setIsCalculated(true)
	}

	const totalAmount = results.reduce((sum, result) => sum + result.finalCost, 0)
	const handlePrint = () => window.print()

	return (
		<AppLayout title="فاکتور سریع و محاسبه تستی">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">فاکتور سریع</h1>
					<p className="text-sm text-slate-500 mt-1">محاسبه و صدور پیش‌نمایش تستی خدمات برای یک شرکت</p>
				</div>
				<Badge variant="warning">تستی</Badge>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
				<Card className="xl:col-span-3">
					<CardHeader>
						<CardTitle>
							<IoCalculatorOutline className="w-5 h-5 text-blue-700" />
							اطلاعات فاکتور و خدمات
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<Select
							label="شرکت طرف حساب"
							value={companyId}
							onChange={(event) => {
								setCompanyId(event.target.value)
								setIsCalculated(false)
							}}
							options={MOCK_COMPANIES.map((company) => ({ value: company.id, label: company.name }))}
						/>
						<Input
							label="نام کالا / شرح محموله"
							required
							placeholder="مثال: سه تریلی ماشین گرانول"
							value={cargoName}
							onChange={(event) => {
								setCargoName(event.target.value)
								setIsCalculated(false)
							}}
						/>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Select
								label="نوع کالا"
								value={cargoType}
								onChange={(event) => {
									setCargoType(event.target.value as CargoType)
									setIsCalculated(false)
								}}
								options={cargoTypeOptions}
							/>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-bold text-slate-800">ردیف‌های خدمت</h3>
								<Button
									variant="outlined"
									size="sm"
									icon={<IoAddOutline className="w-4 h-4" />}
									onClick={() => setLines((currentLines) => [...currentLines, createLine()])}
								>
									افزودن خدمت
								</Button>
							</div>

							{lines.map((line, index) => {
								const service = MOCK_SERVICES.find((item) => item.id === line.serviceId)
								return (
									<div key={line.id} className="grid grid-cols-1 md:grid-cols-[1fr_150px_42px] gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-100">
									<Select
										label={`خدمت ${toPersianDigits(index + 1)}`}
										value={line.serviceId}
										onChange={(event) => updateLine(line.id, { serviceId: event.target.value })}
										options={MOCK_SERVICES.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
									/>
									<Input
										label={`مقدار (${service?.unitTitleFa || 'واحد'})`}
										type="number"
										min="1"
										value={line.quantity}
										onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) || 1 })}
									/>
									<Button
										variant="danger"
										size="sm"
										icon={<IoTrashOutline className="w-4 h-4" />}
										aria-label="حذف ردیف"
										disabled={lines.length === 1}
										onClick={() => setLines((currentLines) => currentLines.filter((item) => item.id !== line.id))}
									>
										حذف
									</Button>
								</div>
								)
							})}
						</div>

						<Button variant="filled" className="w-full" icon={<IoCalculatorOutline className="w-4 h-4" />} onClick={handleCalculate}>
							محاسبه و ساخت فاکتور تستی
						</Button>
					</CardContent>
				</Card>

				<Card className="xl:col-span-2 border-blue-200 print-invoice">
					<CardHeader>
						<CardTitle>
							<IoDocumentTextOutline className="w-5 h-5 text-blue-700" />
							پیش‌نمایش فاکتور تستی
						</CardTitle>
					</CardHeader>
					<CardContent>
						{!isCalculated ? (
							<div className="py-16 text-center text-sm text-slate-400">خدمات را وارد کنید و دکمه محاسبه را بزنید.</div>
						) : (
							<div className="space-y-4 text-xs">
								<div className="no-print flex justify-end">
									<Button variant="filled" size="sm" icon={<IoPrintOutline className="w-4 h-4" />} onClick={handlePrint}>چاپ / ذخیره PDF</Button>
								</div>
								<div className="border-2 border-slate-300 bg-white p-4 space-y-4">
									<div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
										<div className="flex items-center gap-2">
											<img src="/rail-gostar-logo.svg" alt="لوگوی ریل گستر" className="w-16 h-16 object-contain" />
											<div><h2 className="text-base font-black text-slate-900">ریل گستر لجستیک راه آسیا</h2><p className="text-[10px] text-slate-500">سامانه مدیریت و خدمات لجستیک ریلی</p><p className="text-[10px] text-slate-500">ریل گستر</p></div>
										</div>
										<div className="text-left space-y-1">
											<h2 className="font-black text-sm">پیش‌فاکتور فروش و خدمات</h2>
											<p>نسخه فوری - صدور مستقیم</p>
											<p>شماره سند: {documentNumber}</p>
											<p>تاریخ صدور: {new Date().toLocaleDateString('fa-IR')}</p>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="border border-slate-400 p-3">
											<p className="font-black border-b border-slate-300 pb-1 mb-2">مشخصات فروشنده / ارائه‌دهنده خدمت</p>
											<p className="font-bold">ریل گستر لجستیک راه آسیا</p>
											<p>شناسه ملی: ۱۴۰۱۲۶۹۶۸۹۵</p><p>تلفن: ۰۹۱۵۱۱۲۰۱۳۸</p>
										</div>
										<div className="border border-slate-400 p-3">
											<p className="font-black border-b border-slate-300 pb-1 mb-2">مشخصات خریدار / مشتری طرف حساب</p>
											<p className="font-bold">{selectedCompany.name}</p>
											<p>شناسه ملی: {toPersianDigits(selectedCompany.nationalId)}</p>
										</div>
									</div>
										<div className="border border-slate-400 p-2"><span className="font-bold">موضوع خدمات / شرح محموله: </span>{cargoName} - نوع کالا: {cargoTypeOptions.find((option) => option.value === cargoType)?.label}</div>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>ردیف</TableHead>
											<TableHead>خدمت</TableHead>
											<TableHead>نوع کالا</TableHead>
											<TableHead>واحد</TableHead>
											<TableHead>مقدار</TableHead>
											<TableHead>نرخ واحد</TableHead>
											<TableHead>مبلغ</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{results.map((result, index) => (
											<TableRow key={`${result.serviceId}-${index}`}>
												<TableCell>{toPersianDigits(index + 1)}</TableCell>
												<TableCell className="text-xs font-semibold">{result.serviceName}</TableCell>
												<TableCell>{MOCK_SERVICES.find((service) => service.id === lines[index].serviceId)?.unitTitleFa}</TableCell>
												<TableCell>{toPersianDigits(result.quantity)}</TableCell>
												<TableCell>{formatRial(result.appliedRate, false)}</TableCell>
												<TableCell className="font-bold">{formatRial(result.finalCost, false)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<div className="flex justify-end"><div className="w-64 border border-slate-400 p-3 space-y-2">
									<div className="flex justify-between"><span>جمع ناخالص پایه:</span><b>{formatRial(totalAmount)}</b></div>
									<div className="flex justify-between"><span>مالیات بر ارزش افزوده (۱۰٪):</span><b>{formatRial(Math.round(totalAmount * 0.1))}</b></div>
									<div className="flex justify-between border-t-2 border-slate-500 pt-2 text-sm font-black"><span>مبلغ نهایی قابل پرداخت:</span><b className="text-blue-800">{formatToman(Math.round(totalAmount * 1.1))}</b></div>
								</div></div>
								<div className="grid grid-cols-2 gap-8 pt-8 text-center font-bold"><div>مهر و امضای فروشنده<br /><br />ریل گستر لجستیک راه آسیا</div><div>مهر و امضای خریدار / تحویل‌گیرنده<br /><br />{selectedCompany.name}</div></div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AppLayout>
	)
}
