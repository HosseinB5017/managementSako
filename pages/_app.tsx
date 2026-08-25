import React from 'react'
import type { AppProps } from 'next/app'
import { Vazirmatn } from 'next/font/google'
import { AuthProvider } from '@/lib/services/auth-context'
import '@/styles/globals.css'

const vazirmatn = Vazirmatn({
	subsets: ['arabic', 'latin'],
	display: 'swap',
	variable: '--font-vazirmatn',
})

export default function App({ Component, pageProps }: AppProps) {
	return (
		<div className={`${vazirmatn.variable} font-sans`}>
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</div>
	)
}
