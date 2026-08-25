module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				'vazir': ['var(--font-vazirmatn)', 'Vazirmatn', 'sans-serif'],
			},
			spacing: {
				'safe': 'env(safe-area-inset-bottom)',
			},
		},
	},
	plugins: [
		require('tailwindcss-safe-area'),
		function({ addUtilities }) {
			const newUtilities = {
				'.space-x-reverse > :not([hidden]) ~ :not([hidden])': {
					'--tw-space-x-reverse': '1',
				},
			}
			addUtilities(newUtilities)
		}
	],
}
