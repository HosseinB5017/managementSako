import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { Company, CompanyContact } from '@/lib/types/logistics'
import { formatToman, toPersianDigits } from '@/lib/utils/formatters'
import { getCompanyInvoiceDiscount, setCompanyInvoiceDiscount } from '@/lib/utils/company-discounts'
import {
	IoBusinessOutline,
	IoSearchOutline,
	IoAddOutline,
	IoEyeOutline,
	IoCallOutline,
	IoPersonOutline,
	IoDocumentTextOutline,
} from 'react-icons/io5'
import Link from 'next/link'

export default function CompaniesPage() {
	const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
	const [discountPercentage, setDiscountPercentage] = useState(0)

	const filteredCompanies = companies.filter(
		(c) =>
			c.name.includes(searchTerm) ||
			c.nationalId.includes(searchTerm) ||
			c.phone.includes(searchTerm)
	)

	const handleViewDetails = (company: Company) => {
		const companyWithDiscount = {
			...company,
			invoiceDiscountPercentage: getCompanyInvoiceDiscount(company.id, company.invoiceDiscountPercentage || 0),
		}
		setSelectedCompany(companyWithDiscount)
		setDiscountPercentage(companyWithDiscount.invoiceDiscountPercentage || 0)
		setIsDetailModalOpen(true)
	}

	const handleSaveDiscount = () => {
		if (!selectedCompany) return
		const normalizedDiscount = Math.min(100, Math.max(0, discountPercentage || 0))
		setCompanyInvoiceDiscount(selectedCompany.id, normalizedDiscount)
		const updatedCompany = { ...selectedCompany, invoiceDiscountPercentage: normalizedDiscount }
		setSelectedCompany(updatedCompany)
		setCompanies((currentCompanies) =>
			currentCompanies.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
		)
	}

	return (
		<AppLayout title="مدیریت شرکت‌ها و مشتریان">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">شرکت‌ها و مشتریان</h1>
					<p className="text-sm text-slate-500 mt-1">
						مدیریت پروفایل حقوقی/حقیقی مشتریان، نمایندگان، قراردادها و مانده حساب
					</p>
				</div>
				<Link href="/companies/new">
					<Button variant="filled" size="sm" icon={<IoAddOutline className="w-4 h-4" />}>
						ثبت شرکت جدید
					</Button>
				</Link>
			</div>

			{/* Search & Filter Bar */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجو بر اساس نام شرکت، شناسه ملی یا شماره تماس..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
					<div className="text-xs text-slate-500 mr-auto font-medium">
						تعداد کل شرکت‌ها: <span className="font-bold text-slate-800">{toPersianDigits(filteredCompanies.length)}</span>
					</div>
				</div>
			</Card>

			{/* Companies Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>نام شرکت / مشتری</TableHead>
							<TableHead>شناسه ملی</TableHead>
							<TableHead>نماینده اصلی</TableHead>
							<TableHead>شماره تماس</TableHead>
							<TableHead>تعداد قرارداد</TableHead>
							<TableHead>تخفیف فاکتور</TableHead>
							<TableHead>مانده حساب جاری</TableHead>
							<TableHead>وضعیت</TableHead>
							<TableHead>عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCompanies.map((comp) => {
							const mainContact = comp.contacts.find((c) => c.isMainContact) || comp.contacts[0]
							const isDebtor = comp.totalBalance > 0
							const isCreditor = comp.totalBalance < 0

							return (
								<TableRow key={comp.id}>
									<TableCell>
										<div className="font-bold text-slate-800">{comp.name}</div>
										<div className="text-[11px] text-slate-400">کد ثبت: {comp.registrationNumber || '-'}</div>
									</TableCell>
									<TableCell className="font-mono text-xs">{toPersianDigits(comp.nationalId)}</TableCell>
									<TableCell>
										{mainContact ? (
											<div>
												<p className="font-semibold text-slate-700">{mainContact.fullName}</p>
												<p className="text-[11px] text-slate-400">{mainContact.mobile}</p>
											</div>
										) : (
											<span className="text-slate-400 text-xs">ثبت نشده</span>
										)}
									</TableCell>
									<TableCell>{comp.phone}</TableCell>
									<TableCell>{toPersianDigits(comp.contracts.length)} قرارداد</TableCell>
									<TableCell>
										{getCompanyInvoiceDiscount(comp.id, comp.invoiceDiscountPercentage || 0) > 0 ? (
											<Badge variant="success">
												{toPersianDigits(getCompanyInvoiceDiscount(comp.id, comp.invoiceDiscountPercentage || 0))}%
											</Badge>
										) : (
											<span className="text-xs text-slate-400">بدون تخفیف</span>
										)}
									</TableCell>
									<TableCell>
										<span
											className={`font-bold ${
												isDebtor ? 'text-rose-600' : isCreditor ? 'text-emerald-600' : 'text-slate-700'
											}`}
										>
											{formatToman(comp.totalBalance)}
										</span>
									</TableCell>
									<TableCell>
										{comp.isActive ? (
											<Badge variant="success">فعال</Badge>
										) : (
											<Badge variant="error">غیرفعال</Badge>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1.5">
											<Button
												variant="outlined"
												size="sm"
												icon={<IoEyeOutline className="w-4 h-4" />}
												onClick={() => handleViewDetails(comp)}
											>
												مشاهده پرونده
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</Card>

			{/* Company Detail Modal */}
			{selectedCompany && (
				<Modal
					isOpen={isDetailModalOpen}
					onClose={() => setIsDetailModalOpen(false)}
					title={`پرونده جامع: ${selectedCompany.name}`}
					maxWidth="2xl"
				>
					<div className="space-y-6">
						<div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
							<div className="flex items-center justify-between gap-3 mb-3">
								<div>
									<h4 className="text-sm font-bold text-slate-800">تخفیف کلی فاکتور شرکت</h4>
									<p className="text-[11px] text-slate-500 mt-1">این درصد هنگام صدور فاکتور روی کل مبلغ خدمات اعمال می‌شود.</p>
								</div>
								<span className="text-xs font-bold text-emerald-700">درصد</span>
							</div>
							<div className="flex items-end gap-2">
								<Input
									label="درصد تخفیف"
									type="number"
									min="0"
									max="100"
									value={discountPercentage}
									onChange={(event) => setDiscountPercentage(Number(event.target.value))}
								/>
								<Button variant="filled" size="sm" onClick={handleSaveDiscount}>
									ذخیره تخفیف
								</Button>
							</div>
						</div>

						{/* Overview Header */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
							<div>
								<span className="text-slate-400 block mb-1">شناسه ملی</span>
								<span className="font-bold text-slate-800 font-mono">
									{toPersianDigits(selectedCompany.nationalId)}
								</span>
							</div>
							<div>
								<span className="text-slate-400 block mb-1">کد اقتصادی</span>
								<span className="font-bold text-slate-800">
									{selectedCompany.economicCode ? toPersianDigits(selectedCompany.economicCode) : '-'}
								</span>
							</div>
							<div>
								<span className="text-slate-400 block mb-1">شماره تماس</span>
								<span className="font-bold text-slate-800">{selectedCompany.phone}</span>
							</div>
							<div>
								<span className="text-slate-400 block mb-1">وضعیت مالی</span>
								<span
									className={`font-bold ${
										selectedCompany.totalBalance > 0
											? 'text-rose-600'
											: selectedCompany.totalBalance < 0
											? 'text-emerald-600'
											: 'text-slate-700'
									}`}
								>
									{formatToman(selectedCompany.totalBalance)}
								</span>
							</div>
						</div>

						{/* Contacts Section */}
						<div>
							<h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
								<IoPersonOutline className="w-4 h-4 text-blue-600" />
								نمایندگان و رابطین شرکت ({toPersianDigits(selectedCompany.contacts.length)})
							</h4>
							<div className="space-y-2">
								{selectedCompany.contacts.map((contact) => (
									<div
										key={contact.id}
										className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
									>
										<div>
											<p className="font-bold text-slate-800">{contact.fullName}</p>
											<p className="text-slate-500 text-[11px] mt-0.5">
												سمت: {contact.position} | موبایل: {contact.mobile}
											</p>
										</div>
										<div className="flex gap-1">
											{contact.isMainContact && <Badge variant="primary">نماینده اصلی</Badge>}
											{contact.isFinancialContact && <Badge variant="warning">رابط مالی</Badge>}
											{contact.receiveInvoices && <Badge variant="success">گیرنده فاکتور</Badge>}
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Contracts Section */}
						<div>
							<h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
								<IoDocumentTextOutline className="w-4 h-4 text-blue-600" />
								قراردادهای اختصاصی ({toPersianDigits(selectedCompany.contracts.length)})
							</h4>
							{selectedCompany.contracts.length > 0 ? (
								<div className="space-y-2">
									{selectedCompany.contracts.map((cntr) => (
										<div
											key={cntr.id}
											className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs space-y-1.5"
										>
											<div className="flex justify-between items-center">
												<span className="font-bold text-blue-900">
													شماره: {cntr.contractNumber}
												</span>
												<Badge variant="primary">معتبر تا {cntr.endDate}</Badge>
											</div>
											<p className="text-slate-600 text-[11px]">
												تخفیف کلی: {toPersianDigits(cntr.discountPercentage || 0)}% | شرایط: {cntr.specialTerms || 'تعرفه استاندارد'}
											</p>
										</div>
									))}
								</div>
							) : (
								<p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
									هیچ قرارداد اختصاصی برای این شرکت ثبت نشده است (تعرفه عمومی پایه محاسبه می‌شود).
								</p>
							)}
						</div>
					</div>
				</Modal>
			)}
		</AppLayout>
	)
}
