import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_COMPANIES, MOCK_PAYMENTS } from '@/lib/mock-data/logistics-mock'
import { Payment } from '@/lib/types/logistics'
import { formatToman, formatRial, toPersianDigits, getPersianTodayDate } from '@/lib/utils/formatters'
import {
	IoCardOutline,
	IoAddOutline,
	IoSearchOutline,
	IoCheckmarkCircleOutline,
	IoWalletOutline,
} from 'react-icons/io5'

export default function CustomerAccountsPage() {
	const [companies, setCompanies] = useState(MOCK_COMPANIES)
	const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS)
	const [searchTerm, setSearchTerm] = useState('')
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [amountToman, setAmountToman] = useState<number>(10000000)
	const [paymentMethod, setPaymentMethod] = useState<any>('bank_transfer')
	const [bankName, setBankName] = useState('بانک ملت')
	const [trackingCode, setTrackingCode] = useState('TR-88229910')

	const handleRecordPayment = (e: React.FormEvent) => {
		e.preventDefault()
		const comp = companies.find((c) => c.id === selectedCompanyId)!

		const newPayment: Payment = {
			id: `pay_${Date.now()}`,
			receiptNumber: `PAY-1405-${payments.length + 100}`,
			companyId: comp.id,
			companyName: comp.name,
			amountRial: amountToman * 10,
			paymentMethod,
			paymentDate: getPersianTodayDate(),
			bankName,
			trackingCode,
			isVerified: true,
			recordedBy: 'اپراتور مالی',
		}

		setPayments([newPayment, ...payments])

		// Update company balance
		setCompanies(
			companies.map((c) =>
				c.id === selectedCompanyId
					? { ...c, totalBalance: c.totalBalance - amountToman * 10 }
					: c
			)
		)

		setIsPaymentModalOpen(false)
	}

	return (
		<AppLayout title="حساب مشتریان و دریافت وجه">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">حساب مشتریان، مانده بدهی و پرداخت‌ها</h1>
					<p className="text-sm text-slate-500 mt-1">
						مدیریت تراکنش‌های مالی، بدهی/بستانکاری، واریزی‌ها (نقدی، حواله، چک، کارتخوان)
					</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoAddOutline className="w-4 h-4" />}
					onClick={() => setIsPaymentModalOpen(true)}
				>
					ثبت دریافت وجه / پرداخت جدید
				</Button>
			</div>

			{/* Customer Accounts Overview Table */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<IoWalletOutline className="w-5 h-5 text-blue-700" />
								مانده حساب جاری شرکت‌ها
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>نام شرکت</TableHead>
										<TableHead>شناسه ملی</TableHead>
										<TableHead>مانده حساب</TableHead>
										<TableHead>وضعیت حساب</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{companies.map((c) => {
										const isDebtor = c.totalBalance > 0
										const isCreditor = c.totalBalance < 0

										return (
											<TableRow key={c.id}>
												<TableCell className="font-bold text-slate-800">{c.name}</TableCell>
												<TableCell className="font-mono text-xs">{toPersianDigits(c.nationalId)}</TableCell>
												<TableCell
													className={`font-black text-sm ${
														isDebtor ? 'text-rose-600' : isCreditor ? 'text-emerald-600' : 'text-slate-700'
													}`}
												>
													{formatToman(c.totalBalance)}
												</TableCell>
												<TableCell>
													{isDebtor ? (
														<Badge variant="error">بدهکار</Badge>
													) : isCreditor ? (
														<Badge variant="success">بستانکار</Badge>
													) : (
														<Badge variant="neutral">تسویه</Badge>
													)}
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				{/* Recent Payments Received (1 Col) */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								<IoCardOutline className="w-5 h-5 text-emerald-600" />
								آخرین دریافتی‌ها ({toPersianDigits(payments.length)})
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{payments.map((p) => (
								<div
									key={p.id}
									className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs"
								>
									<div className="flex justify-between items-center">
										<span className="font-bold text-slate-800">{p.companyName}</span>
										<span className="font-bold text-emerald-700">{formatToman(p.amountRial)}</span>
									</div>
									<div className="flex justify-between text-slate-400 text-[11px]">
										<span>
											{p.paymentMethod === 'bank_transfer' && 'حواله بانکی'}
											{p.paymentMethod === 'cheque' && 'چک مدت‌دار'}
											{p.paymentMethod === 'card_pos' && 'کارتخوان'}
										</span>
										<span>{p.paymentDate}</span>
									</div>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Record Payment Modal */}
			<Modal
				isOpen={isPaymentModalOpen}
				onClose={() => setIsPaymentModalOpen(false)}
				title="ثبت دریافت وجه و تسویه حساب"
				maxWidth="md"
			>
				<form onSubmit={handleRecordPayment} className="space-y-4">
					<Select
						label="شرکت پرداخت‌کننده"
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						options={companies.map((c) => ({ value: c.id, label: `${c.name} (بدهی: ${formatToman(c.totalBalance)})` }))}
					/>

					<Input
						label="مبلغ دریافتی (تومان)"
						type="number"
						required
						min="10000"
						value={amountToman}
						onChange={(e) => setAmountToman(Number(e.target.value) || 0)}
					/>

					<Select
						label="روش پرداخت"
						value={paymentMethod}
						onChange={(e) => setPaymentMethod(e.target.value)}
						options={[
							{ value: 'bank_transfer', label: 'حواله پایا / ساتنا' },
							{ value: 'card_pos', label: 'کارتخوان (POS)' },
							{ value: 'cheque', label: 'چک صیادی' },
							{ value: 'cash', label: 'نقدی' },
							{ value: 'credit', label: 'اعتباری' },
						]}
					/>

					<div className="grid grid-cols-2 gap-3">
						<Input label="نام بانک" value={bankName} onChange={(e) => setBankName(e.target.value)} />
						<Input
							label="کد رهگیری / شماره چک"
							value={trackingCode}
							onChange={(e) => setTrackingCode(e.target.value)}
						/>
					</div>

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm">
							ثبت سند دریافت و کسر از بدهی
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}
