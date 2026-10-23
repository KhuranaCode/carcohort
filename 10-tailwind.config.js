/** @type {import('tailwindcss').Config} */
// Cinematic dark theme. The existing slate/brand/status tokens are re-mapped
// (not renamed) so every page keeps its markup: slate scale is inverted
// (50 = page, 900 = headline white), brand is now signal red.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#050506', 900: '#0a0a0c', 800: '#111114', 700: '#18181c', 600: '#222228' },
        slate: {
          50: '#0a0a0c', 100: '#17171b', 200: '#26262c', 300: '#3a3a42', 400: '#8d8d99',
          500: '#a6a6b1', 600: '#bdbdc6', 700: '#d6d6dc', 800: '#e9e9ed', 900: '#ffffff',
        },
        brand: {
          50: '#1d0d10', 100: '#2d1115', 200: '#4d1a20', 300: '#ff7b73', 400: '#ff4d44',
          500: '#e50914', 600: '#c40812', 700: '#ff6a62', 800: '#ff8780', 900: '#ffffff', 950: '#ffffff',
        },
        accent: { 300: '#ff9a93', 400: '#ff3b30', 500: '#e50914', 600: '#ff6a62' },
        emerald: { 50: '#0b2a20', 100: '#0f3326', 600: '#34d399', 700: '#6ee7b7', 800: '#86efac', 400: '#34d399' },
        amber: { 50: '#2b2008', 100: '#33250a', 400: '#fbbf24', 600: '#fbbf24', 700: '#fcd34d', 800: '#fde68a', 950: '#1a1203' },
        red: { 100: '#3a1015', 600: '#ff6b63', 700: '#ff8a83' },
        sky: { 100: '#0e2433', 800: '#7dd3fc' },
        violet: { 100: '#241a3d', 800: '#c4b5fd' },
      },
      fontFamily: {
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
        lift: '0 1px 0 rgba(255,255,255,0.06) inset, 0 28px 60px -24px rgba(229,9,20,0.35)',
      },
    },
  },
  plugins: [],
}
