import React, { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { IranPlateView, IranPlateInputGroup, formatIranPlate, parseIranPlate } from '@/components/ui/iran-plate'
import { MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { toPersianDigits } from '@/lib/utils/formatters'
import { IoAddOutline, IoCarSportOutline, IoCreateOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5'

type TransitNationality = 'iranian' | 'foreign'

type TransitTrailer = {
	id: string
	plateNumber: string
	nationality: TransitNationality
	plateCode: string
	platePart1: string
	plateLetter: string
	plateLetterCustom: string
	platePart2: string
	ownerCompany: string
	driverName: string
	vehicleType: string
	vehicleModel: string
	modelYear: string
	notes: string
}

const STORAGE_KEY = 'managesako-transit-trailers'

export default function TransitTrailersPage() {
	const [trailers, setTrailers] = useState<TransitTrailer[]>([])
	const [filter, setFilter] = useState<'all' | TransitNationality>('all')
	const [searchTerm, setSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingTrailer, setEditingTrailer] = useState<TransitTrailer | null>(null)

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(STORAGE_KEY)
			if (saved) setTrailers(JSON.parse(saved) as TransitTrailer[])
		} catch {
			setTrailers([])
		}
	}, [])

	const visibleTrailers = useMemo(
		() =>
			trailers.filter((trailer) => {
				const matchesFilter = filter === 'all' || trailer.nationality === filter
				const matchesSearch = `${trailer.plateNumber} ${trailer.driverName} ${trailer.vehicleType}`.includes(searchTerm)
				return matchesFilter && matchesSearch
			}),
		[trailers, filter, searchTerm]
	)

	const saveTrailer = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!editingTrailer) return
		const plateNumber =
			editingTrailer.nationality === 'iranian'
				? formatIranPlate(
						editingTrailer.platePart1,
						editingTrailer.plateLetter === 'custom' ? editingTrailer.plateLetterCustom : editingTrailer.plateLetter,
						editingTrailer.platePart2,
						editingTrailer.plateCode
				  )
				: editingTrailer.plateNumber
		const trailerToSave = { ...editingTrailer, plateNumber }
		const updated = trailers.some((trailer) => trailer.id === editingTrailer.id)
			? trailers.map((trailer) => (trailer.id === editingTrailer.id ? trailerToSave : trailer))
			: [trailerToSave, ...trailers]
		setTrailers(updated)
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
		setEditingTrailer(null)
		setIsModalOpen(false)
	}

	const deleteTrailer = (id: string) => {
		if (!window.confirm('آیا از حذف این تریلی مطمئن هستید؟')) return
		const updated = trailers.filter((trailer) => trailer.id !== id)
		setTrailers(updated)
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
	}

	const openNew = () => {
		setEditingTrailer({
			id: `trailer_${Date.now()}`,
			plateNumber: '',
			nationality: 'iranian',
			plateCode: '',
			platePart1: '',
			plateLetter: 'ع',
			plateLetterCustom: '',
			platePart2: '',
			driverName: '',
			vehicleType: '',
			vehicleModel: '',
			modelYear: '',
			ownerCompany: '',
			notes: '',
		})
		setIsModalOpen(true)
	}

	const openEdit = (trailer: TransitTrailer) => {
		// اگر پلاک ملی پر نشده بود، از رشته plateNumber پارس کنیم
		if (trailer.nationality === 'iranian' && (!trailer.platePart1 || !trailer.plateLetter)) {
			const parsed = parseIranPlate(trailer.plateNumber)
			setEditingTrailer({
				...trailer,
				platePart1: parsed.part1 || trailer.platePart1 || '',
				plateLetter: parsed.letter || trailer.plateLetter || 'ع',
				platePart2: parsed.part2 || trailer.platePart2 || '',
				plateCode: parsed.code || trailer.plateCode || '',
			})
		} else {
			setEditingTrailer({ ...trailer })
		}
		setIsModalOpen(true)
	}

	return (
		<AppLayout title="تریلی ترانزیت">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">تریلی ترانزیت</h1>
					<p className="text-sm text-slate-500 mt-1">ثبت و مشاهده فهرست تریلی‌های ترانزیت</p>
				</div>
				<Button variant="filled" size="sm" icon={<IoAddOutline className="w-4 h-4" />} onClick={openNew}>
					افزودن تریلی ترانزیت
				</Button>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
						<CardTitle>
							<IoCarSportOutline className="w-5 h-5 text-blue-700" />
							لیست تریلی‌های ترانزیت ({toPersianDigits(visibleTrailers.length)})
						</CardTitle>
						<div className="flex gap-2">
							<Button size="sm" variant={filter === 'all' ? 'filled' : 'outlined'} onClick={() => setFilter('all')}>
								همه
							</Button>
							<Button
								size="sm"
								variant={filter === 'iranian' ? 'filled' : 'outlined'}
								onClick={() => setFilter('iranian')}
							>
								ایرانی
							</Button>
							<Button
								size="sm"
								variant={filter === 'foreign' ? 'filled' : 'outlined'}
								onClick={() => setFilter('foreign')}
							>
								خارجی
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input
						placeholder="جستجو بر اساس پلاک، راننده یا نوع ماشین..."
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						icon={<IoSearchOutline className="w-4 h-4" />}
					/>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>شماره پلاک</TableHead>
								<TableHead>ملیت</TableHead>
								<TableHead>نام راننده</TableHead>
								<TableHead>نوع ماشین</TableHead>
								<TableHead>عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{visibleTrailers.map((trailer) => (
								<TableRow key={trailer.id}>
									<TableCell>
										<IranPlateView plate={trailer.plateNumber} nationality={trailer.nationality} size="sm" />
									</TableCell>
									<TableCell>
										<Badge variant={trailer.nationality === 'iranian' ? 'primary' : 'warning'}>
											{trailer.nationality === 'iranian' ? 'ایرانی' : 'خارجی'}
										</Badge>
									</TableCell>
									<TableCell>{trailer.driverName || '-'}</TableCell>
									<TableCell>{trailer.vehicleType || '-'}</TableCell>
									<TableCell>
										<div className="flex gap-1.5">
											<Button
												variant="outlined"
												size="sm"
												icon={<IoCreateOutline className="w-3.5 h-3.5" />}
												onClick={() => openEdit(trailer)}
											>
												ویرایش
											</Button>
											<Button
												variant="danger"
												size="sm"
												icon={<IoTrashOutline className="w-3.5 h-3.5" />}
												onClick={() => deleteTrailer(trailer.id)}
											>
												حذف
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{visibleTrailers.length === 0 && (
						<p className="py-8 text-center text-sm text-slate-500">هنوز تریلی ترانزیتی ثبت نشده است.</p>
					)}
				</CardContent>
			</Card>

			{editingTrailer && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false)
						setEditingTrailer(null)
					}}
					title="ثبت تریلی ترانزیت"
					maxWidth="lg"
				>
					<form onSubmit={saveTrailer} className="space-y-5">
						<div className="rounded-xl border border-slate-200 p-4 space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-slate-800 text-sm">مشخصات شماره پلاک</h3>
								<div className="flex rounded-lg bg-slate-100 p-1">
									<button
										type="button"
										className={`px-3 py-1.5 text-xs rounded-md transition-all ${
											editingTrailer.nationality === 'iranian'
												? 'bg-white shadow-xs font-bold text-blue-700'
												: 'text-slate-500'
										}`}
										onClick={() => setEditingTrailer({ ...editingTrailer, nationality: 'iranian' })}
									>
										پلاک ملی ایران
									</button>
									<button
										type="button"
										className={`px-3 py-1.5 text-xs rounded-md transition-all ${
											editingTrailer.nationality === 'foreign'
												? 'bg-white shadow-xs font-bold text-blue-700'
												: 'text-slate-500'
										}`}
										onClick={() => setEditingTrailer({ ...editingTrailer, nationality: 'foreign' })}
									>
										پلاک ترانزیت / خارجی
									</button>
								</div>
							</div>

							{editingTrailer.nationality === 'iranian' ? (
								<IranPlateInputGroup
									part1={editingTrailer.platePart1}
									onChangePart1={(val) => setEditingTrailer({ ...editingTrailer, platePart1: val })}
									letter={editingTrailer.plateLetter}
									onChangeLetter={(val) => setEditingTrailer({ ...editingTrailer, plateLetter: val })}
									letterCustom={editingTrailer.plateLetterCustom}
									onChangeLetterCustom={(val) => setEditingTrailer({ ...editingTrailer, plateLetterCustom: val })}
									part2={editingTrailer.platePart2}
									onChangePart2={(val) => setEditingTrailer({ ...editingTrailer, platePart2: val })}
									code={editingTrailer.plateCode}
									onChangeCode={(val) => setEditingTrailer({ ...editingTrailer, plateCode: val })}
								/>
							) : (
								<Input
									label="شماره پلاک خارجی / ترانزیت"
									maxLength={20}
									placeholder="مثال: 99-A-741 TR"
									value={editingTrailer.plateNumber}
									onChange={(event) =>
										setEditingTrailer({ ...editingTrailer, plateNumber: event.target.value.slice(0, 20) })
									}
								/>
							)}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input
								label="مدل و مشخصات فنی خودرو"
								placeholder="مثلاً ولوو FH500 سقف بلند با تریلر کفی سه محور"
								value={editingTrailer.vehicleModel}
								onChange={(event) =>
									setEditingTrailer({
										...editingTrailer,
										vehicleModel: event.target.value,
										vehicleType: event.target.value,
									})
								}
							/>
							<Input
								label="سال ساخت خودرو"
								value={editingTrailer.modelYear}
								onChange={(event) => setEditingTrailer({ ...editingTrailer, modelYear: event.target.value })}
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Select
								label="شرکت مالک / پیمانکار (اختیاری)"
								value={editingTrailer.ownerCompany}
								onChange={(event) => setEditingTrailer({ ...editingTrailer, ownerCompany: event.target.value })}
								options={[
									{ value: '', label: 'بدون شرکت مالک' },
									...MOCK_COMPANIES.map((company) => ({ value: company.name, label: company.name })),
								]}
							/>
							<Input
								label="راننده اختصاصی (اختیاری)"
								value={editingTrailer.driverName}
								onChange={(event) => setEditingTrailer({ ...editingTrailer, driverName: event.target.value })}
							/>
						</div>
						<Input
							label="توضیحات و مجوزهای خاص (اختیاری)"
							value={editingTrailer.notes}
							placeholder="شامل مجوز حمل مواد خطرناک، ترمز ABS، محدودیت بارگیری یا شماره شاسی..."
							onChange={(event) => setEditingTrailer({ ...editingTrailer, notes: event.target.value })}
						/>
						<div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
							<Button
								type="button"
								variant="outlined"
								onClick={() => {
									setIsModalOpen(false)
									setEditingTrailer(null)
								}}
							>
								انصراف
							</Button>
							<Button type="submit" variant="filled">
								ذخیره تریلی
							</Button>
						</div>
					</form>
				</Modal>
			)}
		</AppLayout>
	)
}
