import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { useRouter } from 'next/router'
import { IoBusinessOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'

export default function NewCompanyPage() {
	const router = useRouter()
	const [name, setName] = useState('')
	const [nationalId, setNationalId] = useState('')
	const [economicCode, setEconomicCode] = useState('')
	const [registrationNumber, setRegistrationNumber] = useState('')
	const [phone, setPhone] = useState('')
	const [address, setAddress] = useState('')
	const [contactName, setContactName] = useState('')
	const [contactMobile, setContactMobile] = useState('')
	const [contactPosition, setContactPosition] = useState('مدیر بازرگانی')
	const [invoiceDiscountPercentage, setInvoiceDiscountPercentage] = useState(0)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		alert('شرکت با موفقیت ثبت شد.')
		router.push('/companies')
	}

	return (
		<AppLayout title="ثبت شرکت جدید">
			<div className="flex items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">ثبت شرکت و مشتری جدید</h1>
					<p className="text-sm text-slate-500 mt-1">تکمیل مشخصات ثبتی، حقوقی، اطلاعات تماس و نماینده اصلی</p>
				</div>
			</div>

			<Card className="max-w-3xl">
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
							اطلاعات حقوقی و ثبتی
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="نام کامل شرکت / سازمان"
								required
								placeholder="مثال: شرکت لجستیک راه‌آهن شرق"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
							<Input
								label="شناسه ملی (۱۱ رقمی)"
								required
								placeholder="1010..."
								value={nationalId}
								onChange={(e) => setNationalId(e.target.value)}
							/>
							<Input
								label="کد اقتصادی"
								placeholder="411..."
								value={economicCode}
								onChange={(e) => setEconomicCode(e.target.value)}
							/>
							<Input
								label="شماره ثبت"
								placeholder="شماره ثبت در اداره ثبت شرکت‌ها"
								value={registrationNumber}
								onChange={(e) => setRegistrationNumber(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
							اطلاعات تماس و نشانی
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="تلفن ثابت دفتر مرکزی"
								required
								placeholder="021-..."
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
							<Input
								label="نشانی دقیق"
								required
								placeholder="استان، شهر، خیابان..."
								value={address}
								onChange={(e) => setAddress(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
							مشخصات نماینده اصلی و رابط
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<Input
								label="نام و نام خانوادگی نماینده"
								required
								value={contactName}
								onChange={(e) => setContactName(e.target.value)}
							/>
							<Input
								label="شماره موبایل نماینده"
								required
								placeholder="0912..."
								value={contactMobile}
								onChange={(e) => setContactMobile(e.target.value)}
							/>
							<Input
								label="سمت سازمانی"
								value={contactPosition}
								onChange={(e) => setContactPosition(e.target.value)}
							/>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
							تنظیمات مالی شرکت
						</h3>
						<div className="max-w-xs">
							<Input
								label="تخفیف روی کل فاکتور (درصد)"
								type="number"
								min="0"
								max="100"
								value={invoiceDiscountPercentage}
								onChange={(e) => setInvoiceDiscountPercentage(Math.min(100, Math.max(0, Number(e.target.value))))}
							/>
							<p className="text-[11px] text-slate-500 mt-1.5">
								این تخفیف هنگام صدور فاکتور تجمیعی از کل مبلغ خدمات کم می‌شود.
							</p>
						</div>
					</div>

					<div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
						<Button type="button" variant="outlined" onClick={() => router.push('/companies')}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" icon={<IoCheckmarkCircleOutline className="w-4 h-4" />}>
							ثبت و ذخیره شرکت
						</Button>
					</div>
				</form>
			</Card>
		</AppLayout>
	)
}
