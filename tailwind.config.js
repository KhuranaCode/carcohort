/** @type {import('tailwindcss').Config} */
// Sakura-style light editorial theme. Token NAMES are unchanged so every page
// keeps its markup; values are remapped: slate is now a warm dark-readable
// scale on paper, brand is the Sakura signal red, ink stays the deep black
// used by dark sections.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#f2f1ed', deep: '#e9e7e1', card: '#fbfaf7' },
        ink: { 950: '#161616', 900: '#252525', 800: '#2e2e2e', 700: '#3a3a3a', 600: '#4a4a4a' },
        slate: {
          50: '#faf9f6', 100: '#efeee8', 200: '#dcdad2', 300: '#b9b6ac', 400: '#918e84',
          500: '#6e6b62', 600: '#54524b', 700: '#3d3b36', 800: '#2b2a26', 900: '#1f1e1b',
        },
        brand: {
          50: '#fdecea', 100: '#f9d5d2', 200: '#f2a8a2', 300: '#ff7b73', 400: '#f0584f',
          500: '#e03e39', 600: '#c22f2b', 700: '#a02724', 800: '#7c1f1c', 900: '#252525', 950: '#252525',
        },
        accent: { 300: '#ff9a93', 400: '#f0584f', 500: '#e03e39', 600: '#ff6a62' },
        emerald: { 50: '#e7f4ee', 100: '#d3eadd', 600: '#1f8a5b', 700: '#22a06a', 800: '#2cb57a', 400: '#1f8a5b' },
        amber: { 50: '#faf1dd', 100: '#f3e3c2', 400: '#c98a1b', 600: '#b07a14', 700: '#96680f', 800: '#7d580d', 950: '#3c2c07' },
        red: { 100: '#f9d5d2', 600: '#c22f2b', 700: '#a02724' },
        sky: { 100: '#dcebf5', 800: '#2a6f9e' },
        violet: { 100: '#e6dff5', 800: '#6b4fa8' },
      },
      fontFamily: {
        display: ['Butler', 'Georgia', 'serif'],
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,22,22,0.05), 0 18px 44px -28px rgba(22,22,22,0.28)',
        lift: '0 2px 4px rgba(22,22,22,0.06), 0 30px 60px -26px rgba(224,62,57,0.32)',
      },
    },
  },
  plugins: [],
}
