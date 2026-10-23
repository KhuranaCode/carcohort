/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#4f46e5', 600: '#4338ca', 700: '#3730a3',
          800: '#2b2a72', 900: '#1e2150', 950: '#12132e',
        },
        accent: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,19,46,0.06), 0 8px 24px -12px rgba(18,19,46,0.18)',
        lift: '0 4px 8px rgba(18,19,46,0.06), 0 20px 44px -16px rgba(18,19,46,0.28)',
      },
    },
  },
  plugins: [],
}
