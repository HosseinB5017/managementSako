import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input, Select } from '@/components/ui/input'
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data/logistics-mock'
import { toPersianDigits } from '@/lib/utils/formatters'
import { IoTimeOutline, IoSearchOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'

export default function AuditLogsPage() {
	const [logs, setLogs] = useState(MOCK_AUDIT_LOGS)
	const [searchTerm, setSearchTerm] = useState('')

	const filteredLogs = logs.filter(
		(l) =>
			l.userName.includes(searchTerm) ||
			l.details.includes(searchTerm) ||
			l.ipAddress.includes(searchTerm)
	)

	return (
		<AppLayout title="لاگ فعالیت‌ها و رخدادهای سیستم">
			{/* Page Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">لاگ امنیتی و ردگیری عملیات کاربران (Audit Log)</h1>
					<p className="text-sm text-slate-500 mt-1">
						ثبت بدون امکان تغییر تمام تراکنش‌ها، تغییرات تعرفه، ورود کالا، صدور فاکتور و شناسه IP
					</p>
				</div>
			</div>

			{/* Search */}
			<Card className="mb-6">
				<div className="w-full sm:w-96">
					<Input
						placeholder="جستجو در لاگ‌ها، کاربر، جزئیات یا IP..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						icon={<IoSearchOutline className="w-4 h-4" />}
					/>
				</div>
			</Card>

			{/* Logs Table */}
			<Card>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>زمان رخداد</TableHead>
							<TableHead>کاربر ثبت‌کننده</TableHead>
							<TableHead>نوع عملیات</TableHead>
							<TableHead>موجودیت</TableHead>
							<TableHead>شرح و جزئیات عملیات</TableHead>
							<TableHead>آدرس IP</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredLogs.map((log) => (
							<TableRow key={log.id}>
								<TableCell className="text-xs font-mono text-slate-500">{log.timestamp}</TableCell>
								<TableCell className="font-bold text-slate-800 text-xs">{log.userName}</TableCell>
								<TableCell>
									{log.action === 'create' && <Badge variant="success">ایجاد رکورد</Badge>}
									{log.action === 'update' && <Badge variant="warning">ویرایش</Badge>}
									{log.action === 'delete' && <Badge variant="error">حذف</Badge>}
								</TableCell>
								<TableCell className="text-xs font-semibold text-slate-700">
									{log.entityType}
								</TableCell>
								<TableCell className="text-xs text-slate-700 leading-relaxed max-w-md">
									{log.details}
								</TableCell>
								<TableCell className="font-mono text-[11px] text-slate-400">{log.ipAddress}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>
		</AppLayout>
	)
}
