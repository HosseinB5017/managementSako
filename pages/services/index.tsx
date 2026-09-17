import React, { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_SERVICES } from '@/lib/mock-data/logistics-mock'
import { ServiceUnit, SystemService, TariffPrices } from '@/lib/types/logistics'
import { formatRial } from '@/lib/utils/formatters'
import { IoCreateOutline, IoPricetagOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5'

const categoryLabels: Record<string, string> = {
	transshipment: 'ترانشیپ',
	traffic: 'تردد و ورود',
	equipment: 'تجهیزات',
	rail: 'ریلی و واگن',
	storage: 'انبارداری',
	insurance: 'بیمه',
	special: 'خدمات ویژه',
}

const categoryOptions = [
	{ value: 'all', label: 'همه دسته‌بندی‌ها' },
	...Object.entries(categoryLabels).map(([value, label]) => ({ value, label })),
]

const unitLabels: Record<ServiceUnit, string> = {
	fixed: 'مقطوع',
	per_operation: 'هر عملیات',
	per_hour: 'هر ساعت',
	per_day: 'هر روز',
	per_ton: 'هر تن',
	per_wagon: 'هر واگن',
	per_vehicle: 'هر دستگاه',
}

const unitOptions = Object.entries(unitLabels).map(([value, label]) => ({ value, label }))
const SERVICES_STORAGE_KEY = 'managesako-services'

const getServicePrices = (service: SystemService): TariffPrices => service.prices || {
	normal: service.basePriceRial,
	heavy: Math.round(service.basePriceRial * 1.15),
	dangerous: Math.round(service.basePriceRial * 1.3),
}

export default function ServicesPage() {
	const [services, setServices] = useState<SystemService[]>(MOCK_SERVICES)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [statusFilter, setStatusFilter] = useState('all')
	const [sortBy, setSortBy] = useState('name')
	const [editingService, setEditingService] = useState<SystemService | null>(null)

	useEffect(() => {
		try {
			const savedServices = window.localStorage.getItem(SERVICES_STORAGE_KEY)
			if (savedServices) setServices(JSON.parse(savedServices) as SystemService[])
		} catch {
			setServices(MOCK_SERVICES)
		}
	}, [])

	const filteredServices = useMemo(() => {
		return services
			.filter((service) => {
				const matchesSearch = `${service.code} ${service.name}`.includes(searchTerm)
				const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
				const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? service.isActive : !service.isActive)
				return matchesSearch && matchesCategory && matchesStatus
			})
			.sort((first, second) => {
				if (sortBy === 'price-asc') return first.basePriceRial - second.basePriceRial
				if (sortBy === 'price-desc') return second.basePriceRial - first.basePriceRial
				return first.name.localeCompare(second.name, 'fa')
			})
	}, [services, searchTerm, categoryFilter, statusFilter, sortBy])

	const saveService = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!editingService || !editingService.name.trim() || editingService.basePriceRial <= 0) return
		const serviceToSave = editingService
		const updatedServices = services.map((service) => (service.id === serviceToSave.id ? serviceToSave : service))
		setServices(updatedServices)
		window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices))
		setEditingService(null)
	}

	const deleteService = (serviceId: string) => {
		if (!window.confirm('آیا از حذف این خدمت مطمئن هستید؟')) return
		const updatedServices = services.filter((service) => service.id !== serviceId)
		setServices(updatedServices)
		window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(updatedServices))
	}

	return (
		<AppLayout title="خدمات">
			<div className="mb-6">
				<h1 className="text-2xl font-black text-slate-900 tracking-tight">خدمات</h1>
				<p className="text-sm text-slate-500 mt-1">فهرست خدمات قابل محاسبه سامانه</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
						<CardTitle><IoPricetagOutline className="w-5 h-5 text-blue-700" />فهرست خدمات</CardTitle>
						<span className="text-xs text-slate-500">{filteredServices.length} خدمت</span>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
						<Input label="جستجو" placeholder="نام یا کد خدمت" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} icon={<IoSearchOutline className="w-4 h-4" />} />
						<Select label="دسته‌بندی" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} options={categoryOptions} />
						<Select label="وضعیت" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ value: 'all', label: 'همه وضعیت‌ها' }, { value: 'active', label: 'فعال' }, { value: 'inactive', label: 'غیرفعال' }]} />
						<Select label="مرتب‌سازی" value={sortBy} onChange={(event) => setSortBy(event.target.value)} options={[{ value: 'name', label: 'نام خدمت' }, { value: 'price-asc', label: 'قیمت: کم به زیاد' }, { value: 'price-desc', label: 'قیمت: زیاد به کم' }]} />
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>کد</TableHead>
								<TableHead>نام خدمت</TableHead>
								<TableHead>دسته‌بندی</TableHead>
								<TableHead>واحد محاسبه</TableHead>
								<TableHead>قیمت عادی</TableHead>
								<TableHead>قیمت سنگین</TableHead>
								<TableHead>قیمت خطرناک</TableHead>
								<TableHead>وضعیت</TableHead>
								<TableHead>عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredServices.map((service) => (
								<TableRow key={service.id}>
									<TableCell className="font-mono text-xs font-bold text-blue-700">{service.code}</TableCell>
									<TableCell className="font-bold text-slate-800">{service.name}</TableCell>
									<TableCell>{categoryLabels[service.category] || service.category}</TableCell>
									<TableCell className="text-xs">{unitLabels[service.unit] || service.unitTitleFa}</TableCell>
									{(['normal', 'heavy', 'dangerous'] as const).map((cargoType) => (
										<TableCell key={cargoType}>
											<div className="font-semibold">{formatRial(getServicePrices(service)[cargoType], false)}</div>
										</TableCell>
									))}
									<TableCell><Badge variant={service.isActive ? 'success' : 'error'}>{service.isActive ? 'فعال' : 'غیرفعال'}</Badge></TableCell>
									<TableCell><div className="flex gap-1.5"><Button variant="outlined" size="sm" icon={<IoCreateOutline className="w-3.5 h-3.5" />} onClick={() => setEditingService({ ...service })}>ویرایش</Button><Button variant="danger" size="sm" icon={<IoTrashOutline className="w-3.5 h-3.5" />} onClick={() => deleteService(service.id)}>حذف</Button></div></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					{filteredServices.length === 0 && <p className="py-8 text-center text-sm text-slate-500">خدمتی با این فیلتر پیدا نشد.</p>}
				</CardContent>
			</Card>

			{editingService && <Modal isOpen={true} onClose={() => setEditingService(null)} title="ویرایش خدمت" maxWidth="md"><form onSubmit={saveService} className="space-y-4"><Input label="کد خدمت" value={editingService.code} onChange={(event) => setEditingService({ ...editingService, code: event.target.value })} /><Input label="نام خدمت" required value={editingService.name} onChange={(event) => setEditingService({ ...editingService, name: event.target.value })} /><Select label="دسته‌بندی" value={editingService.category} onChange={(event) => setEditingService({ ...editingService, category: event.target.value as SystemService['category'] })} options={categoryOptions.filter((option) => option.value !== 'all')} /><Select label="واحد محاسبه" value={editingService.unit} onChange={(event) => setEditingService({ ...editingService, unit: event.target.value as ServiceUnit, unitTitleFa: unitLabels[event.target.value as ServiceUnit] })} options={unitOptions} /><Input label="قیمت پایه (ریال)" type="number" min="1" required value={editingService.basePriceRial} onChange={(event) => setEditingService({ ...editingService, basePriceRial: Number(event.target.value) || 0 })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingService.isActive} onChange={(event) => setEditingService({ ...editingService, isActive: event.target.checked })} /> خدمت فعال است</label><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outlined" onClick={() => setEditingService(null)}>انصراف</Button><Button type="submit" variant="filled">ذخیره تغییرات</Button></div></form></Modal>}
		</AppLayout>
	)
}
