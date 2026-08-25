import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { MOCK_USERS } from '@/lib/mock-data/logistics-mock'
import { User, UserRole } from '@/lib/types/logistics'
import { toPersianDigits } from '@/lib/utils/formatters'
import { IoPeopleOutline, IoAddOutline, IoPersonAddOutline } from 'react-icons/io5'

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>(MOCK_USERS)
	const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
	const [fullName, setFullName] = useState('')
	const [username, setUsername] = useState('')
	const [phone, setPhone] = useState('')
	const [role, setRole] = useState<UserRole>('operator')

	const handleCreateUser = (e: React.FormEvent) => {
		e.preventDefault()
		const newUser: User = {
			id: `u_${Date.now()}`,
			fullName,
			username,
			phone,
			role,
			isActive: true,
			createdAt: '1405/06/04',
		}
		setUsers([...users, newUser])
		setIsNewUserModalOpen(false)
		setFullName('')
		setUsername('')
		setPhone('')
	}

	return (
		<AppLayout title="مدیریت کاربران و سطوح دسترسی">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">کاربران سیستم و نقش‌ها (RBAC)</h1>
					<p className="text-sm text-slate-500 mt-1">تعریف پرسنل، سوپر ادمین، مدیران فنی، مدیران ناظر و اپراتورهای عملیات</p>
				</div>
				<Button
					variant="filled"
					size="sm"
					icon={<IoPersonAddOutline className="w-4 h-4" />}
					onClick={() => setIsNewUserModalOpen(true)}
				>
					افزودن کاربر جدید
				</Button>
			</div>

			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>نام و نام خانوادگی</TableHead>
							<TableHead>نام کاربری</TableHead>
							<TableHead>نقش و سطح دسترسی</TableHead>
							<TableHead>شماره تماس</TableHead>
							<TableHead>تاریخ ثبت</TableHead>
							<TableHead>وضعیت</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((u) => (
							<TableRow key={u.id}>
								<TableCell className="font-bold text-slate-800">{u.fullName}</TableCell>
								<TableCell className="font-mono text-xs text-blue-700">{u.username}</TableCell>
								<TableCell>
									{u.role === 'super_admin' && <Badge variant="primary">سوپر ادمین (دسترسی کامل)</Badge>}
									{u.role === 'admin' && <Badge variant="warning">مدیر فنی</Badge>}
									{u.role === 'manager' && <Badge variant="neutral">مدیر ناظر</Badge>}
									{u.role === 'operator' && <Badge variant="success">اپراتور عملیات</Badge>}
								</TableCell>
								<TableCell className="font-mono text-xs">{u.phone}</TableCell>
								<TableCell className="text-xs">{u.createdAt}</TableCell>
								<TableCell>
									<Badge variant="success">فعال</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			<Modal
				isOpen={isNewUserModalOpen}
				onClose={() => setIsNewUserModalOpen(false)}
				title="تعریف کاربر و تعیین نقش"
				maxWidth="md"
			>
				<form onSubmit={handleCreateUser} className="space-y-4">
					<Input
						label="نام و نام خانوادگی"
						required
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
					/>
					<Input
						label="نام کاربری (جهت ورود)"
						required
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<Input
						label="شماره موبایل"
						required
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
					/>
					<Select
						label="نقش کاربری"
						value={role}
						onChange={(e) => setRole(e.target.value as UserRole)}
						options={[
							{ value: 'operator', label: 'اپراتور (فقط ثبت عملیات و تردد)' },
							{ value: 'manager', label: 'مدیر ناظر (داشبورد و گزارشات)' },
							{ value: 'admin', label: 'مدیر فنی (مدیریت شرکت‌ها، کالا، انبار و تعرفه)' },
							{ value: 'super_admin', label: 'سوپر ادمین (دسترسی کامل سیستم)' },
						]}
					/>
					<div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
						<Button type="button" variant="outlined" size="sm" onClick={() => setIsNewUserModalOpen(false)}>
							انصراف
						</Button>
						<Button type="submit" variant="filled" size="sm">
							ثبت کاربر
						</Button>
					</div>
				</form>
			</Modal>
		</AppLayout>
	)
}
