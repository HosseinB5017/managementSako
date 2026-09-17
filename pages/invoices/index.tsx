import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_INVOICES, MOCK_COMPANIES, MOCK_SERVICES } from '@/lib/mock-data/logistics-mock'
import { Invoice } from '@/lib/types/logistics'
import { formatToman, formatRial, toPersianDigits, getPersianTodayDate } from '@/lib/utils/formatters'
import { getCompanyInvoiceDiscount } from '@/lib/utils/company-discounts'
import {
	IoDocumentTextOutline,
	IoAddOutline,
	IoPrintOutline,
	IoEyeOutline,
	IoCheckmarkDoneOutline,
	IoSearchOutline,
} from 'react-icons/io5'

export default function InvoicesPage() {
	const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

	const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [periodStart, setPeriodStart] = useState('1405/06/01')
	const [periodEnd, setPeriodEnd] = useState('1405/06/31')

	const handleCreateConsolidatedInvoice = (e: React.FormEvent) => {
		e.preventDefault()
		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!
		const companyDiscountPercentage = getCompanyInvoiceDiscount(company.id, company.invoiceDiscountPercentage || 0)
		const subtotalAmount = 165000000
		const existingItemDiscount = 13500000
		const companyDiscountAmount = Math.round((subtotalAmount * companyDiscountPercentage) / 100)
		const totalDiscount = existingItemDiscount + companyDiscountAmount
		const firstItemCompanyDiscount = Math.round((companyDiscountAmount * 135000000) / subtotalAmount)
		const secondItemCompanyDiscount = companyDiscountAmount - firstItemCompanyDiscount
		const totalInsurance = 5000000
		const totalTax = 15650000
		const finalPayableAmount = subtotalAmount - totalDiscount + totalInsurance + totalTax

		const newInvoice: Invoice = {
			id: `invc_${Date.now()}`,
			invoiceNumber: `INV-1405-00${invoices.length + 1}`,
			companyId: company.id,
			companyName: company.name,
			companyNationalId: company.nationalId,
			periodStart,
			periodEnd,
			issuedDate: getPersianTodayDate(),
			dueDate: '1405/07/15',
			status: 'issued',
			items: [
				{
					id: `item_1`,
					serviceId: 'srv_1',
					serviceName: 'ترانشیپمنت مستقیم و خدمات بارانداز',
					dateTime: '1405/06/02',
					quantity: 3,
					unitTitle: 'عملیات',
					unitPrice: 45000000,
					discountAmount: 13500000 + firstItemCompanyDiscount,
					insuranceAmount: 2000000,
					taxAmount: 12350000,
					finalTotal: 135000000 - 13500000 - firstItemCompanyDiscount + 2000000 + 12350000,
				},
				{
					id: `item_2`,
					serviceId: 'srv_11',
					serviceName: 'انبارداری کالاهای وارداتی در محوطه',
					dateTime: '1405/06/04',
					quantity: 1200,
					unitTitle: 'تن/ساعت',
					unitPrice: 25000,
					discountAmount: secondItemCompanyDiscount,
					insuranceAmount: 3000000,
					taxAmount: 3300000,
					finalTotal: 30000000 - secondItemCompanyDiscount + 3000000 + 3300000,
				},
			],
			subtotalAmount,
			totalDiscount,
			companyDiscountPercentage,
			companyDiscountAmount,
			totalInsurance,
			totalTax,
			finalPayableAmount,
			paidAmount: 0,
			remainingAmount: finalPayableAmount,
			notes: 'فاکتور تجمیعی کلیه خدمات ارائه شده در دوره شهریور ماه',
		}

		setInvoices([newInvoice, ...invoices])
		setIsNewInvoiceModalOpen(false)
	}

	const handlePrint = () => {
		window.print()
	}

	return (
		<AppLayout title="مدیریت فاکتورهای تجمیعی">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">فاکتورهای تجمیعی و صورتحساب‌ها</h1>
					<p className="text-sm text-slate-500 mt-1">
						صدور دوره‌ای فاکتور جامع شامل کلیه خدمات (ورود، انبار، ترانشیپ، لیفتراک، بیمه و مالیات)
					</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoAddOutline className="w-4 h-4" />}
					onClick={() => setIsNewInvoiceModalOpen(true)}
				>
					صدور فاکتور تجمیعی جدید
				</Button>
			</div>

			{/* Invoices List */}
			<Card className="mb-6">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>شماره فاکتور</TableHead>
							<TableHead>شرکت متقاضی</TableHead>
							<TableHead>بازه زمانی خدمات</TableHead>
							<TableHead>تاریخ صدور</TableHead>
							<TableHead>مبلغ کل ناخالص</TableHead>
							<TableHead>تخفیف / بیمه</TableHead>
							<TableHead>مبلغ قابل پرداخت</TableHead>
							<TableHead>مانده تصفیه نشده</TableHead>
							<TableHead>وضعیت</TableHead>
							<TableHead>عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{invoices.map((inv) => (
							<TableRow key={inv.id}>
								<TableCell className="font-mono text-xs font-bold text-blue-700">
									{inv.invoiceNumber}
								</TableCell>
								<TableCell className="font-bold text-slate-800">{inv.companyName}</TableCell>
								<TableCell className="text-xs text-slate-500">
									{inv.periodStart} تا {inv.periodEnd}
								</TableCell>
								<TableCell className="text-xs">{inv.issuedDate}</TableCell>
								<TableCell className="text-xs font-semibold text-slate-700">
									{formatToman(inv.subtotalAmount)}
								</TableCell>
								<TableCell className="text-xs text-emerald-700">
									-{formatToman(inv.totalDiscount)}
								</TableCell>
								<TableCell className="font-bold text-slate-900">
									{formatToman(inv.finalPayableAmount)}
								</TableCell>
								<TableCell className="font-black text-rose-700">
									{formatToman(inv.remainingAmount)}
								</TableCell>
								<TableCell>
									{inv.status === 'issued' && <Badge variant="warning">صادر شده</Badge>}
									{inv.status === 'paid' && <Badge variant="success">تسویه کامل</Badge>}
									{inv.status === 'partially_paid' && <Badge variant="primary">پرداخت جزئی</Badge>}
								</TableCell>
								<TableCell>
									<Button
										variant="outlined"
										size="sm"
										icon={<IoEyeOutline className="w-3.5 h-3.5" />}
										onClick={() => {
											setSelectedInvoice(inv)
											setIsDetailModalOpen(true)
										}}
									>
										مشاهده و چاپ
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{/* Invoice Printable View Modal */}
			{selectedInvoice && (
				<Modal
					isOpen={isDetailModalOpen}
					onClose={() => setIsDetailModalOpen(false)}
					title={`صورتحساب رسمی: ${selectedInvoice.invoiceNumber}`}
					maxWidth="3xl"
				>
					<div className="space-y-6">
						{/* Print Actions Bar */}
						<div className="flex justify-end gap-2 no-print">
							<Button variant="filled" size="sm" icon={<IoPrintOutline className="w-4 h-4" />} onClick={handlePrint}>
								چاپ فاکتور رسمی
							</Button>
						</div>

						{/* Invoice Document Card */}
						<div className="p-6 border-2 border-slate-200 rounded-2xl bg-white space-y-6">
							{/* Official Header */}
							<div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
								<div className="flex items-center gap-2">
									<img src="/rail-gostar-logo.svg" alt="لوگوی ریل گستر" className="w-16 h-16 object-contain" />
									<div><h2 className="text-lg font-black text-slate-900">ریل گستر لجستیک راه آسیا</h2><p className="text-xs text-slate-500 mt-1">سامانه مدیریت و خدمات لجستیک ریلی</p><p className="text-[10px] text-slate-500">ریل گستر</p></div>
								</div>
								<div className="text-center font-black text-sm">پیش‌فاکتور فروش و خدمات<br /><span className="text-[10px] font-normal">نسخه فوری - صدور مستقیم</span></div>
								<div className="text-left text-xs space-y-1">
									<p>
										<span className="text-slate-400">شماره: </span>
										<span className="font-bold font-mono">{selectedInvoice.invoiceNumber}</span>
									</p>
									<p>
										<span className="text-slate-400">تاریخ: </span>
										<span className="font-bold">{selectedInvoice.issuedDate}</span>
									</p>
								</div>
							</div>

							{/* Customer Info */}
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
								<div>
									<span className="text-slate-400 block mb-0.5">نام خریدار / شرکت:</span>
									<span className="font-bold text-slate-900">{selectedInvoice.companyName}</span>
								</div>
								<div>
									<span className="text-slate-400 block mb-0.5">شناسه ملی:</span>
									<span className="font-bold font-mono">{toPersianDigits(selectedInvoice.companyNationalId)}</span>
								</div>
								<div>
									<span className="text-slate-400 block mb-0.5">دوره ارائه خدمات:</span>
									<span className="font-semibold">{selectedInvoice.periodStart} تا {selectedInvoice.periodEnd}</span>
								</div>
							</div>

							{/* Items Table */}
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>ردیف</TableHead>
										<TableHead>شرح خدمات ارائه شده</TableHead>
										<TableHead>تعداد / مقدار</TableHead>
										<TableHead>واحد</TableHead>
										<TableHead>نرخ پایه (ریال)</TableHead>
										<TableHead>تخفیف</TableHead>
										<TableHead>مبلغ کل (ریال)</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selectedInvoice.items.map((item, index) => (
										<TableRow key={item.id}>
											<TableCell className="text-center font-bold">{toPersianDigits(index + 1)}</TableCell>
											<TableCell className="font-bold text-slate-800">{item.serviceName}</TableCell>
											<TableCell>{toPersianDigits(item.quantity)}</TableCell>
											<TableCell>{item.unitTitle}</TableCell>
											<TableCell>{formatRial(item.unitPrice, false)}</TableCell>
											<TableCell className="text-emerald-700">
												{item.discountAmount > 0 ? formatRial(item.discountAmount, false) : '-'}
											</TableCell>
											<TableCell className="font-bold">{formatRial(item.finalTotal, false)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>

							{/* Financial Totals Summary */}
							<div className="flex justify-end">
								<div className="w-72 bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
									<div className="flex justify-between">
										<span className="text-slate-500">جمع ناخالص خدمات:</span>
										<span className="font-semibold">{formatRial(selectedInvoice.subtotalAmount)}</span>
									</div>
									<div className="flex justify-between text-emerald-700">
										<span>تخفیف ویژه قرارداد:</span>
										<span>-{formatRial(selectedInvoice.totalDiscount - (selectedInvoice.companyDiscountAmount || 0))}</span>
									</div>
									{(selectedInvoice.companyDiscountAmount || 0) > 0 && (
										<div className="flex justify-between text-emerald-700">
											<span>تخفیف کلی شرکت ({toPersianDigits(selectedInvoice.companyDiscountPercentage || 0)}٪):</span>
											<span>-{formatRial(selectedInvoice.companyDiscountAmount || 0)}</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-slate-500">هزینه بیمه و پوشش:</span>
										<span>{formatRial(selectedInvoice.totalInsurance)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-500">مالیات بر ارزش افزوده (۱۰٪):</span>
										<span>{formatRial(selectedInvoice.totalTax)}</span>
									</div>
									<div className="flex justify-between border-t-2 border-slate-300 pt-2 font-black text-sm text-slate-900">
										<span>مبلغ کل قابل پرداخت:</span>
										<span className="text-blue-900">{formatToman(selectedInvoice.finalPayableAmount)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
			)}

			{/* New Consolidated Invoice Generator Modal */}
			<Modal
				isOpen={isNewInvoiceModalOpen}
				onClose={() => setIsNewInvoiceModalOpen(false)}
				title="صدور فاکتور تجمیعی جدید برای شرکت"
				maxWidth="md"
			>
				<form onSubmit={handleCreateConsolidatedInvoice} className="space-y-4">
					<Select
						label="انتخاب شرکت طرف حساب"
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
					/>

					<div className="grid grid-cols-2 gap-3">
						<Input
							label="از تاریخ (شروع دوره)"
							value={periodStart}
							onChange={(e) => setPeriodStart(e.target.value)}
						/>
						<Input
							label="تا تاریخ (پایان دوره)"
							value={periodEnd}
							onChange={(e) => setPeriodEnd(e.target.value)}
						/>
					</div>

					<div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-900 leading-relaxed">
						سیستم به صورت خودکار تمام عملیات ثبت‌شده، انبارداری، تردد و خدمات این شرکت در این بازه را استخراج
						کرده و فاکتور تجمیعی صادر می‌کند.
					</div>

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewInvoiceModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm">
							تولید و صدور فاکتور
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}
