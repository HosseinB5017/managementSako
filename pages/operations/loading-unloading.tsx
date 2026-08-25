import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_OPERATIONS, MOCK_COMPANIES, MOCK_SERVICES } from '@/lib/mock-data/logistics-mock'
import { SiteOperation } from '@/lib/types/logistics'
import { formatToman, toPersianDigits } from '@/lib/utils/formatters'
import {
	IoConstructOutline,
	IoAddOutline,
	IoCheckmarkDoneOutline,
	IoSearchOutline,
	IoTrainOutline,
	IoCarSportOutline,
} from 'react-icons/io5'

export default function LoadingUnloadingPage() {
	const [operations, setOperations] = useState<SiteOperation[]>(MOCK_OPERATIONS)
	const [searchTerm, setSearchTerm] = useState('')
	const [isNewModalOpen, setIsNewModalOpen] = useState(false)

	const [selectedCompanyId, setSelectedCompanyId] = useState(MOCK_COMPANIES[0].id)
	const [opType, setOpType] = useState<any>('loading_forklift')
	const [tonnage, setTonnage] = useState<number>(20)
	const [equipment, setEquipment] = useState('لیفتراک ۵ تن تویوتا')
	const [vehiclePlate, setVehiclePlate] = useState('۱۲ ع ۳۴۵ ایران ۲۲')
	const [productName, setProductName] = useState('پالت قطعات صنعتی')

	const handleCreateOperation = (e: React.FormEvent) => {
		e.preventDefault()
		const company = MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!

		const newOp: SiteOperation = {
			id: `op_${Date.now()}`,
			operationCode: `OP-405-10${operations.length + 1}`,
			type: opType,
			companyId: company.id,
			companyName: company.name,
			vehiclePlate,
			productId: 'prod_custom',
			productName,
			tonnage,
			equipmentType: opType.includes('crane') ? 'crane' : 'forklift',
			equipmentId: equipment,
			operatorName: 'حسین احمدی (اپراتور شیفت)',
			startDateTime: '1405/06/04 ۱۲:۳۰',
			unitPrice: 650000,
			totalCalculatedCost: tonnage * 650000,
			status: 'in_progress',
		}

		setOperations([newOp, ...operations])
		setIsNewModalOpen(false)
	}

	const handleCompleteOperation = (opId: string) => {
		setOperations(
			operations.map((o) =>
				o.id === opId
					? {
							...o,
							status: 'completed',
							endDateTime: '1405/06/04 ۱۳:۴۵',
					  }
					: o
			)
		)
	}

	return (
		<AppLayout title="عملیات بارگیری و تخلیه">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">عملیات بارگیری، تخلیه و ترانشیپمنت</h1>
					<p className="text-sm text-slate-500 mt-1">
						ثبت مکانیزه عملیات با لیفتراک، جرثقیل و انتقال بین‌وسایل (کامیون به واگن، سکو و...)
					</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoAddOutline className="w-4 h-4" />}
					onClick={() => setIsNewModalOpen(true)}
				>
					ثبت عملیات جدید
				</Button>
			</div>

			{/* Search */}
			<Card className="mb-6">
				<div className="flex gap-4">
					<div className="w-full sm:w-96">
						<Input
							placeholder="جستجو بر اساس کد عملیات، نام کالا، شرکت یا پلاک..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							icon={<IoSearchOutline className="w-4 h-4" />}
						/>
					</div>
				</div>
			</Card>

			{/* Operations Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>کد عملیات</TableHead>
							<TableHead>نوع عملیات</TableHead>
							<TableHead>شرکت متقاضی</TableHead>
							<TableHead>کالا / محموله</TableHead>
							<TableHead>وسیله / واگن</TableHead>
							<TableHead>تناژ</TableHead>
							<TableHead>تجهیزات به‌کار رفته</TableHead>
							<TableHead>هزینه محاسبه‌شده</TableHead>
							<TableHead>وضعیت</TableHead>
							<TableHead>عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{operations
							.filter(
								(o) =>
									o.operationCode.includes(searchTerm) ||
									o.companyName.includes(searchTerm) ||
									(o.productName && o.productName.includes(searchTerm))
							)
							.map((op) => (
								<TableRow key={op.id}>
									<TableCell className="font-bold font-mono text-xs text-blue-700">
										{op.operationCode}
									</TableCell>
									<TableCell>
										{op.type === 'loading_forklift' && <Badge variant="primary">بارگیری لیفتراک</Badge>}
										{op.type === 'unloading_forklift' && <Badge variant="primary">تخلیه لیفتراک</Badge>}
										{op.type === 'loading_crane' && <Badge variant="warning">بارگیری جرثقیل</Badge>}
										{op.type === 'unloading_crane' && <Badge variant="warning">تخلیه جرثقیل</Badge>}
										{op.type === 'transshipment' && <Badge variant="success">ترانشیپ مستقیم</Badge>}
									</TableCell>
									<TableCell className="max-w-[150px] truncate">{op.companyName}</TableCell>
									<TableCell className="text-xs font-semibold text-slate-800">
										{op.productName || '-'}
									</TableCell>
									<TableCell className="text-xs font-mono">
										{op.vehiclePlate || op.wagonNumber || '-'}
									</TableCell>
									<TableCell className="font-bold text-slate-900">
										{toPersianDigits(op.tonnage)} تن
									</TableCell>
									<TableCell className="text-xs text-slate-500">{op.equipmentId || '-'}</TableCell>
									<TableCell className="font-semibold text-emerald-700">
										{formatToman(op.totalCalculatedCost)}
									</TableCell>
									<TableCell>
										{op.status === 'in_progress' ? (
											<Badge variant="warning">در حال اجرا</Badge>
										) : (
											<Badge variant="success">تکمیل شده</Badge>
										)}
									</TableCell>
									<TableCell>
										{op.status === 'in_progress' ? (
											<Button
												variant="outlined"
												size="sm"
												icon={<IoCheckmarkDoneOutline className="w-4 h-4 text-emerald-600" />}
												onClick={() => handleCompleteOperation(op.id)}
											>
												اتمام عملیات
											</Button>
										) : (
											<span className="text-xs text-slate-400">ثبت در فاکتور</span>
										)}
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</Card>

			{/* New Operation Modal */}
			<Modal
				isOpen={isNewModalOpen}
				onClose={() => setIsNewModalOpen(false)}
				title="ثبت عملیات اجرایی جدید در سکو"
				maxWidth="lg"
			>
				<form onSubmit={handleCreateOperation} className="space-y-4">
					<Select
						label="شرکت متقاضی"
						value={selectedCompanyId}
						onChange={(e) => setSelectedCompanyId(e.target.value)}
						options={MOCK_COMPANIES.map((c) => ({ value: c.id, label: c.name }))}
					/>

					<div className="grid grid-cols-2 gap-3">
						<Select
							label="نوع عملیات"
							value={opType}
							onChange={(e) => setOpType(e.target.value)}
							options={[
								{ value: 'loading_forklift', label: 'بارگیری لیفتراکی' },
								{ value: 'unloading_forklift', label: 'تخلیه لیفتراکی' },
								{ value: 'loading_crane', label: 'بارگیری جرثقیلی' },
								{ value: 'unloading_crane', label: 'تخلیه جرثقیلی' },
								{ value: 'transshipment', label: 'ترانشیپ مستقیم (کامیون/واگن)' },
							]}
						/>
						<Input
							label="تناژ محموله (تن)"
							type="number"
							min="1"
							required
							value={tonnage}
							onChange={(e) => setTonnage(Number(e.target.value) || 1)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Input
							label="عنوان کالا"
							required
							value={productName}
							onChange={(e) => setProductName(e.target.value)}
						/>
						<Input
							label="پلاک خودرو یا شماره واگن"
							required
							value={vehiclePlate}
							onChange={(e) => setVehiclePlate(e.target.value)}
						/>
					</div>

					<Input
						label="دستگاه یا تجهیزات مستقر"
						value={equipment}
						onChange={(e) => setEquipment(e.target.value)}
					/>

					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm">
							ثبت و شروع عملیات
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}
