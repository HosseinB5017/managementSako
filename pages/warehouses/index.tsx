import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_INVENTORY_ITEMS, MOCK_WAREHOUSES, MOCK_COMPANIES } from '@/lib/mock-data/logistics-mock'
import { InventoryItem } from '@/lib/types/logistics'
import { formatToman, toPersianDigits } from '@/lib/utils/formatters'
import {
	IoCubeOutline,
	IoLayersOutline,
	IoWarningOutline,
	IoSwapHorizontalOutline,
	IoArrowDownOutline,
	IoArrowUpOutline,
	IoSearchOutline,
} from 'react-icons/io5'

export default function WarehousesPage() {
	const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY_ITEMS)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all')

	const filteredInventory = inventory.filter((item) => {
		const matchSearch =
			item.productName.includes(searchTerm) ||
			item.productCode.includes(searchTerm) ||
			item.companyName.includes(searchTerm) ||
			item.batchCode.includes(searchTerm)

		if (selectedWarehouseId !== 'all') {
			return matchSearch && item.warehouseId === selectedWarehouseId
		}
		return matchSearch
	})

	return (
		<AppLayout title="مدیریت انبارها و موجودی کالا">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">انبارها و موجودی لحظه‌ای کالا</h1>
					<p className="text-sm text-slate-500 mt-1">
						ردیابی دقیق موقعیت کالا، مدت ماندگاری (روز/ساعت) و محاسبه آنلاین هزینه انبارداری و بیمه
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outlined" size="sm" icon={<IoArrowDownOutline className="w-4 h-4" />}>
						ثبت ورود کالا (رسید انبار)
					</Button>
					<Button variant="filled" size="sm" icon={<IoArrowUpOutline className="w-4 h-4" />}>
						ثبت حواله خروج کالا
					</Button>
				</div>
			</div>

			{/* Warehouses Capacity Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				{MOCK_WAREHOUSES.map((wh) => {
					const percentage = Math.round((wh.usedCapacityTon / wh.totalCapacityTon) * 100)
					return (
						<Card key={wh.id} className="border-slate-200">
							<div className="flex items-start justify-between mb-3">
								<div>
									<h3 className="font-bold text-sm text-slate-800">{wh.name}</h3>
									<p className="text-[11px] text-slate-400">مسئول: {wh.managerName}</p>
								</div>
								<Badge variant={percentage > 80 ? 'error' : percentage > 60 ? 'warning' : 'primary'}>
									{wh.code}
								</Badge>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between text-xs font-semibold">
									<span className="text-slate-600">ظرفیت اشغال شده:</span>
									<span className="text-slate-900">{toPersianDigits(percentage)}%</span>
								</div>
								<div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full ${
											percentage > 80
												? 'bg-rose-500'
												: percentage > 60
												? 'bg-amber-500'
												: 'bg-blue-600'
										}`}
										style={{ width: `${percentage}%` }}
									/>
								</div>
								<div className="flex justify-between text-[11px] text-slate-400">
									<span>{toPersianDigits(wh.usedCapacityTon.toLocaleString('fa-IR'))} تن</span>
									<span>از {toPersianDigits(wh.totalCapacityTon.toLocaleString('fa-IR'))} تن</span>
								</div>
							</div>
						</Card>
					)
				})}
			</div>

			{/* Filter & Search */}
			<Card className="mb-6">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجو کالا، بچ‌نامبر، کد کالا یا شرکت مالک..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
					<div className="w-full sm:w-64">
						<Select
							value={selectedWarehouseId}
							onChange={(e) => setSelectedWarehouseId(e.target.value)}
							options={[
								{ value: 'all', label: 'همه انبارها' },
								...MOCK_WAREHOUSES.map((w) => ({ value: w.id, label: w.name })),
							]}
						/>
					</div>
				</div>
			</Card>

			{/* Real-time Inventory Table */}
			<Card>
				<CardHeader>
					<CardTitle>
						<IoCubeOutline className="w-5 h-5 text-blue-700" />
						موجودی کالاهای مستقر در انبارها ({toPersianDigits(filteredInventory.length)})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>شماره بچ / محموله</TableHead>
								<TableHead>نام کالا و کد</TableHead>
								<TableHead>شرکت مالک</TableHead>
								<TableHead>انبار / موقعیت</TableHead>
								<TableHead>موجودی (تن)</TableHead>
								<TableHead>تاریخ ورود</TableHead>
								<TableHead>مدت ماندگاری</TableHead>
								<TableHead>هزینه انبارداری تا کنون</TableHead>
								<TableHead>هزینه بیمه</TableHead>
								<TableHead>نوع کالا</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredInventory.map((item) => (
								<TableRow key={item.id}>
									<TableCell className="font-mono text-xs font-bold text-slate-800">
										{item.batchCode}
									</TableCell>
									<TableCell>
										<div className="font-bold text-slate-900">{item.productName}</div>
										<div className="text-[11px] text-slate-400 font-mono">{item.productCode}</div>
									</TableCell>
									<TableCell className="max-w-[150px] truncate">{item.companyName}</TableCell>
									<TableCell>
										<div className="text-xs font-semibold text-slate-700">{item.warehouseName}</div>
										<div className="text-[11px] text-blue-700 font-bold">بخش {item.locationCode}</div>
									</TableCell>
									<TableCell className="font-black text-slate-900">
										{toPersianDigits(item.tonnage.toLocaleString('fa-IR'))} تن
									</TableCell>
									<TableCell className="text-xs">{item.entryDateTime}</TableCell>
									<TableCell>
										<span className="font-bold text-amber-700">{toPersianDigits(item.storageDays)} روز</span>
									</TableCell>
									<TableCell className="font-semibold text-slate-800">
										{formatToman(item.accumulatedStorageCost)}
									</TableCell>
									<TableCell className="text-xs text-slate-600">
										{formatToman(item.accumulatedInsuranceCost)}
									</TableCell>
									<TableCell>
										{item.isDangerous ? (
											<Badge variant="error">خطرناک</Badge>
										) : item.isValuable ? (
											<Badge variant="warning">ارزشمند</Badge>
										) : (
											<Badge variant="neutral">عادی</Badge>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</AppLayout>
	)
}
