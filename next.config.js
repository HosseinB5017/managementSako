/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

const withPWA = require('next-pwa')({
	dest: 'public',
	disable: isDev, // Disable PWA service worker in dev mode to eliminate slow re-compilations & SW overhead
	register: true,
	skipWaiting: true,
	publicExcludes: ['!maintenance.json'],
})

module.exports = withPWA({
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'tajanapi.sarakhs.ir',
				pathname: '/download/files/**',
			},
		],
	},
})
