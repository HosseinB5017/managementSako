import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_SERVICES, MOCK_COMPANIES, MOCK_TARIFF_RULES } from '@/lib/mock-data/logistics-mock'
import { calculateServiceCost } from '@/lib/services/calculation-engine'
import { CostCalculationResult } from '@/lib/types/logistics'
import { formatRial, formatToman, toPersianDigits } from '@/lib/utils/formatters'
import {
	IoCalculatorOutline,
	IoPricetagOutline,
	IoFlashOutline,
	IoInformationCircleOutline,
	IoCheckmarkCircleOutline,
} from 'react-icons/io5'

export default function TariffsPage() {
	const [selectedCompanyId, setSelectedCompanyId] = useState<string>(MOCK_COMPANIES[0].id)
	const [selectedServiceId, setSelectedServiceId] = useState<string>(MOCK_SERVICES[0].id)
	const [quantity, setQuantity] = useState<number>(10)
	const [durationHours, setDurationHours] = useState<number>(1)
	const [isDangerous, setIsDangerous] = useState<boolean>(false)
	const [isValuable, setIsValuable] = useState<boolean>(false)
	const [cargoValueToman, setCargoValueToman] = useState<number>(0)

	const [calcResult, setCalcResult] = useState<CostCalculationResult | null>(null)

	// اجرای شبیه‌ساز محاسبه
	const handleCalculate = () => {
		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!
		const activeContract = company.contracts.find((c) => c.status === 'active') || null

		const result = calculateServiceCost({
			serviceId: selectedServiceId,
			company,
			activeContract,
			quantity,
			durationHours,
			isDangerous,
			isValuable,
			estimatedCargoValueRial: cargoValueToman * 10,
		})

		setCalcResult(result)
	}

	const selectedService = MOCK_SERVICES.find((s) => s.id === selectedServiceId)
	const selectedCompany = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)

	return (
		<AppLayout title="تعرفه‌ها و موتور محاسبه خودکار">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">تعرفه‌ها و موتور هوشمند محاسبه</h1>
					<p className="text-sm text-slate-500 mt-1">
						محاسبه آنی هزینه خدمات بر اساس قرارداد مشتری، ضرایب اختصاصی، تناژ، زمان و نوع کالا
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Calculation Simulator Form (1 Col) */}
				<div className="space-y-6">
					<Card className="border-blue-200 shadow-md">
						<CardHeader>
							<CardTitle className="text-blue-900">
								<IoCalculatorOutline className="w-5 h-5 text-blue-700" />
								شبیه‌ساز و تست موتور محاسبه
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Company Select */}
							<Select
								label="شرکت / مشتری طرف حساب"
								value={selectedCompanyId}
								onChange={(e) => setSelectedCompanyId(e.target.value)}
								options={MOCK_COMPANIES.map((c) => ({
									value: c.id,
									label: `${c.name} ${c.contracts.length > 0 ? '(دارای قرارداد)' : ''}`,
								}))}
							/>

							{/* Service Select */}
							<Select
								label="نوع خدمت مورد نظر"
								value={selectedServiceId}
								onChange={(e) => setSelectedServiceId(e.target.value)}
								options={MOCK_SERVICES.map((s) => ({
									value: s.id,
									label: `${s.code} - ${s.name} (${s.unitTitleFa})`,
								}))}
							/>

							{/* Quantity & Unit */}
							<div className="grid grid-cols-2 gap-3">
								<Input
									label={`مقدار (${selectedService?.unitTitleFa || 'واحد'})`}
									type="number"
									min="1"
									value={quantity}
									onChange={(e) => setQuantity(Number(e.target.value) || 1)}
								/>
								{selectedService?.unit === 'per_hour' && (
									<Input
										label="مدت زمان (ساعت)"
										type="number"
										min="1"
										value={durationHours}
										onChange={(e) => setDurationHours(Number(e.target.value) || 1)}
									/>
								)}
							</div>

							{/* Special Checkboxes */}
							<div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
								<label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
									<input
										type="checkbox"
										checked={isDangerous}
										onChange={(e) => setIsDangerous(e.target.checked)}
										className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
									/>
									<span>محموله خطرناک است (+۳۰٪ ضریب ایمنی)</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
									<input
										type="checkbox"
										checked={isValuable}
										onChange={(e) => setIsValuable(e.target.checked)}
										className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
									/>
									<span>محموله ارزشمند / دارای حساسیت خاص (+۲۰٪)</span>
								</label>
							</div>

							<Button
								variant="filled"
								className="w-full"
								size="md"
								icon={<IoFlashOutline className="w-4 h-4" />}
								onClick={handleCalculate}
							>
								محاسبه آنی هزینه
							</Button>

							{/* Result Box */}
							{calcResult && (
								<div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2.5 animate-in fade-in">
									<div className="flex items-center justify-between text-xs text-blue-900 font-bold border-b border-blue-200 pb-2">
										<span>نتیجه محاسبه هزینه:</span>
										<Badge variant="success">معتبر</Badge>
									</div>
									<div className="flex justify-between items-baseline">
										<span className="text-xs text-slate-600">مبلغ نهایی قابل دریافت:</span>
										<span className="text-lg font-black text-blue-950">
											{formatToman(calcResult.finalCost)}
										</span>
									</div>
									<div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-blue-100">
										<p>نرخ پایه: {formatRial(calcResult.basePrice)}</p>
										<p>نرخ اعمال‌شده: {formatRial(calcResult.appliedRate)}</p>
										{calcResult.discountApplied > 0 && (
											<p className="text-emerald-700 font-semibold">
												تخفیف کسر شده: {formatRial(calcResult.discountApplied)}
											</p>
										)}
										<p className="text-slate-600 mt-1 font-mono text-[10px] bg-white p-2 rounded-lg border border-blue-100">
											{calcResult.calculationFormula}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* 21 System Services Base Tariffs Table (2 Cols) */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<IoPricetagOutline className="w-5 h-5 text-blue-700" />
								کاتالوگ و تعرفه پایه ۲۱ خدمت سامانه
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>کد</TableHead>
										<TableHead>عنوان خدمت</TableHead>
										<TableHead>دسته‌بندی</TableHead>
										<TableHead>واحد محاسبه</TableHead>
										<TableHead>تعرفه پایه (ریال)</TableHead>
										<TableHead>معادل تومان</TableHead>
										<TableHead>وضعیت</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{MOCK_SERVICES.map((srv) => (
										<TableRow key={srv.id}>
											<TableCell className="font-mono text-xs font-bold text-blue-700">
												{srv.code}
											</TableCell>
											<TableCell className="font-bold text-slate-800">{srv.name}</TableCell>
											<TableCell>
												{srv.category === 'transshipment' && <Badge variant="primary">ترانشیپ</Badge>}
												{srv.category === 'traffic' && <Badge variant="neutral">تردد و پارکینگ</Badge>}
												{srv.category === 'equipment' && <Badge variant="warning">لیفتراک/جرثقیل</Badge>}
												{srv.category === 'rail' && <Badge variant="primary">ریلی و واگن</Badge>}
												{srv.category === 'storage' && <Badge variant="neutral">انبارداری</Badge>}
												{srv.category === 'special' && <Badge variant="error">ویژه و خطرناک</Badge>}
											</TableCell>
											<TableCell className="text-xs font-medium text-slate-600">
												{srv.unitTitleFa}
											</TableCell>
											<TableCell className="font-semibold text-slate-800">
												{formatRial(srv.basePriceRial, false)}
											</TableCell>
											<TableCell className="text-emerald-700 font-bold text-xs">
												{formatToman(srv.basePriceRial)}
											</TableCell>
											<TableCell>
												<Badge variant="success">فعال</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</AppLayout>
	)
}
