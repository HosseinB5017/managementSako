import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import Head from 'next/head'

interface AppLayoutProps {
	children: React.ReactNode
	title?: string
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title = 'سکوی لجستیک و انبارداری' }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)

	return (
		<div className="min-h-screen flex bg-slate-50 text-slate-900">
			<Head>
				<title>{`${title} | سامانه مدیریت سکو`}</title>
			</Head>

			{/* Multi-tier Sidebar */}
			<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-w-0">
				<Header onMenuToggle={() => setSidebarOpen(true)} />
				<main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
			</div>
		</div>
	)
}
