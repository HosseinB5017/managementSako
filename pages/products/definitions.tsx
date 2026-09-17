import React, { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { IoAddOutline, IoCreateOutline, IoDocumentTextOutline, IoTrashOutline } from 'react-icons/io5'

type ParameterType = 'text' | 'number' | 'select' | 'date' | 'boolean'
type AllowedUnit = 'number' | 'ton' | 'kg'

type ProductParameter = {
	id: string
	name: string
	key: string
	type: ParameterType
	required: boolean
	options: string
}

type DefinitionVersion = {
	version: number
	createdAt: string
	parameters: ProductParameter[]
	units: AllowedUnit[]
}

type ProductDefinition = {
	id: string
	name: string
	code: string
	description: string
	isActive: boolean
	units: AllowedUnit[]
	parameters: ProductParameter[]
	version: number
	versions: DefinitionVersion[]
}

const STORAGE_KEY = 'managesako-product-definitions'
const unitOptions = [
	{ value: 'number', label: 'تعداد' },
	{ value: 'ton', label: 'تن' },
	{ value: 'kg', label: 'کیلوگرم' },
]
const parameterTypeOptions = [
	{ value: 'text', label: 'متن' },
	{ value: 'number', label: 'عدد' },
	{ value: 'select', label: 'انتخابی' },
	{ value: 'date', label: 'تاریخ' },
	{ value: 'boolean', label: 'بله / خیر' },
]
const parameterTypeLabels: Record<ParameterType, string> = {
	text: 'متن',
	number: 'عدد',
	select: 'انتخابی',
	date: 'تاریخ',
	boolean: 'بله / خیر',
}
const unitLabels: Record<AllowedUnit, string> = { number: 'تعداد', ton: 'تن', kg: 'کیلوگرم' }

const createParameter = (): ProductParameter => ({
	id: `parameter_${Date.now()}_${Math.random()}`,
	name: '',
	key: '',
	type: 'text',
	required: false,
	options: '',
})

export default function ProductDefinitionsPage() {
	const [definitions, setDefinitions] = useState<ProductDefinition[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [definitionName, setDefinitionName] = useState('')
	const [definitionCode, setDefinitionCode] = useState('')
	const [definitionDescription, setDefinitionDescription] = useState('')
	const [isActive, setIsActive] = useState(true)
	const [units, setUnits] = useState<AllowedUnit[]>([])
	const [parameters, setParameters] = useState<ProductParameter[]>([createParameter()])

	useEffect(() => {
		try {
			const savedDefinitions = window.localStorage.getItem(STORAGE_KEY)
			if (savedDefinitions) {
				const saved = JSON.parse(savedDefinitions) as ProductDefinition[]
				setDefinitions(saved.map((definition) => ({ ...definition, description: definition.description || '', isActive: definition.isActive !== false })))
			}
		} catch {
			setDefinitions([])
		}
	}, [])

	const resetForm = () => {
		setEditingId(null)
		setDefinitionName('')
		setDefinitionCode('')
		setDefinitionDescription('')
		setIsActive(true)
		setUnits([])
		setParameters([createParameter()])
	}

	const openNew = () => {
		resetForm()
		setIsModalOpen(true)
	}

	const openEdit = (definition: ProductDefinition) => {
		setEditingId(definition.id)
		setDefinitionName(definition.name)
		setDefinitionCode(definition.code)
		setDefinitionDescription(definition.description || '')
		setIsActive(definition.isActive !== false)
		setUnits(definition.units)
		setParameters(definition.parameters.map((parameter) => ({ ...parameter })))
		setIsModalOpen(true)
	}

	const updateParameter = (id: string, changes: Partial<ProductParameter>) => {
		setParameters((current) => current.map((parameter) => (parameter.id === id ? { ...parameter, ...changes } : parameter)))
	}

	const saveDefinition = (event: React.FormEvent) => {
		event.preventDefault()
		const validParameters = parameters.filter((parameter) => parameter.name.trim() && parameter.key.trim())
		if (!definitionName.trim() || !definitionCode.trim() || units.length === 0 || validParameters.length === 0) return

		const existing = definitions.find((definition) => definition.id === editingId)
		const nextVersion = existing ? existing.version + 1 : 1
		const version: DefinitionVersion = {
			version: nextVersion,
			createdAt: new Date().toLocaleDateString('fa-IR'),
			parameters: validParameters,
			units,
		}
		const definition: ProductDefinition = {
			id: existing?.id || `definition_${Date.now()}`,
			name: definitionName.trim(),
			code: definitionCode.trim(),
			description: definitionDescription.trim(),
			isActive,
			units,
			parameters: validParameters,
			version: nextVersion,
			versions: existing ? [...existing.versions, version] : [version],
		}
		const updated = existing ? definitions.map((item) => (item.id === existing.id ? definition : item)) : [definition, ...definitions]
		setDefinitions(updated)
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
		setIsModalOpen(false)
		resetForm()
	}

	const deleteDefinition = (id: string) => {
		if (!window.confirm('آیا از حذف این تعریف مطمئن هستید؟')) return
		const updated = definitions.filter((definition) => definition.id !== id)
		setDefinitions(updated)
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
	}

	return (
		<AppLayout title="مدیریت تعاریف و مشخصات انواع کالا">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">مدیریت تعاریف و مشخصات انواع کالا</h1>
					<p className="text-sm text-slate-500 mt-1">تعریف ساختار پارامترها و واحدهای مجاز، بدون ثبت موجودی یا اطلاعات عملیاتی</p>
				</div>
				<Button variant="filled" size="sm" icon={<IoAddOutline className="w-4 h-4" />} onClick={openNew}>تعریف نوع کالا</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle><IoDocumentTextOutline className="w-5 h-5 text-blue-700" />تعاریف ثبت‌شده</CardTitle>
				</CardHeader>
				<CardContent>
					{definitions.length === 0 ? (
						<div className="py-16 text-center text-sm text-slate-500">هنوز ساختار مشخصاتی تعریف نشده است. از دکمه «تعریف نوع کالا» شروع کنید.</div>
					) : (
						<div className="space-y-3">
							{definitions.map((definition) => (
								<div key={definition.id} className="border border-slate-200 rounded-xl p-4">
									<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
										<div><div className="font-bold text-slate-900 flex items-center gap-2">{definition.name} <span className="text-xs text-slate-400 font-mono">({definition.code})</span><Badge variant={definition.isActive ? 'success' : 'error'}>{definition.isActive ? 'فعال' : 'غیرفعال'}</Badge></div><div className="text-xs text-slate-500 mt-1">واحدهای مجاز: {definition.units.map((unit) => unitLabels[unit]).join('، ')} | نسخه {definition.version}</div>{definition.description && <div className="text-xs text-slate-500 mt-1">{definition.description}</div>}</div>
										<div className="flex gap-2"><Button variant="outlined" size="sm" icon={<IoCreateOutline className="w-3.5 h-3.5" />} onClick={() => openEdit(definition)}>ویرایش و نسخه جدید</Button><Button variant="danger" size="sm" icon={<IoTrashOutline className="w-3.5 h-3.5" />} onClick={() => deleteDefinition(definition.id)}>حذف</Button></div>
									</div>
									<div className="flex flex-wrap gap-2 mt-3">{definition.parameters.map((parameter) => <Badge key={parameter.id} variant="neutral">{parameter.name} | {parameterTypeLabels[parameter.type]} {parameter.required ? '(اجباری)' : '(اختیاری)'}</Badge>)}</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingId ? 'ویرایش تعریف و ثبت نسخه جدید' : 'تعریف نوع کالا'} maxWidth="3xl">
				<form onSubmit={saveDefinition} className="space-y-5">
					<div className="space-y-3"><h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">مشخصات اولیه نوع کالا</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><Input label="نام نوع کالا" required placeholder="مثال: خودرو" value={definitionName} onChange={(event) => setDefinitionName(event.target.value)} /><Input label="کد نوع کالا" required placeholder="مثال: VEHICLE" value={definitionCode} onChange={(event) => setDefinitionCode(event.target.value)} /></div><Input label="توضیحات" placeholder="توضیح کوتاه درباره این نوع کالا" value={definitionDescription} onChange={(event) => setDefinitionDescription(event.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> این نوع کالا فعال باشد</label></div>
					<div><h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">واحدهای مجاز</h3><div className="flex flex-wrap gap-4">{unitOptions.map((unit) => <label key={unit.value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={units.includes(unit.value as AllowedUnit)} onChange={(event) => setUnits((current) => event.target.checked ? [...current, unit.value as AllowedUnit] : current.filter((item) => item !== unit.value))} />{unit.label}</label>)}</div></div>
					<div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">پارامترهای اختصاصی</h3><Button type="button" variant="outlined" size="sm" icon={<IoAddOutline className="w-4 h-4" />} onClick={() => setParameters((current) => [...current, createParameter()])}>افزودن پارامتر</Button></div>{parameters.map((parameter, index) => <div key={parameter.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_150px_100px_42px] gap-2 items-end p-3 bg-slate-50 rounded-xl"><Input label={index === 0 ? 'عنوان پارامتر' : undefined} required value={parameter.name} placeholder="مثال: شماره شاسی" onChange={(event) => updateParameter(parameter.id, { name: event.target.value })} /><Input label={index === 0 ? 'کلید سیستمی' : undefined} required value={parameter.key} placeholder="مثال: chassisNumber" onChange={(event) => updateParameter(parameter.id, { key: event.target.value })} /><Select label={index === 0 ? 'نوع داده' : undefined} value={parameter.type} onChange={(event) => updateParameter(parameter.id, { type: event.target.value as ParameterType })} options={parameterTypeOptions} /><label className="flex items-center gap-2 text-xs pb-2"><input type="checkbox" checked={parameter.required} onChange={(event) => updateParameter(parameter.id, { required: event.target.checked })} />اجباری</label><Button type="button" variant="danger" size="sm" icon={<IoTrashOutline className="w-4 h-4" />} onClick={() => setParameters((current) => current.filter((item) => item.id !== parameter.id))}>حذف</Button>{parameter.type === 'select' && <Input label="گزینه‌ها با ویرگول" value={parameter.options} onChange={(event) => updateParameter(parameter.id, { options: event.target.value })} />}</div>)}</div>
					<div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outlined" onClick={() => { setIsModalOpen(false); resetForm() }}>انصراف</Button><Button type="submit" variant="filled">{editingId ? 'ثبت نسخه جدید' : 'ذخیره تعریف'}</Button></div>
				</form>
			</Modal>
		</AppLayout>
	)
}
