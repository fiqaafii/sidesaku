/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8ecf2',
          100: '#c5d0de',
          200: '#9fb1c8',
          300: '#7892b2',
          400: '#577ba1',
          500: '#356490',
          600: '#2a5280',
          700: '#1e3f6a',
          800: '#142B4A',  // primary navy
          900: '#0c1d32',
        },
        primary: '#142B4A',
        accent:  '#F5C542',
        success: '#237A57',
        bglight: '#F3F6FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(20,43,74,0.06), 0 1px 3px 0 rgba(20,43,74,0.04)',
        'card-hover': '0 12px 24px -6px rgba(20,43,74,0.12), 0 4px 8px -2px rgba(20,43,74,0.06)',
        'card-elevated': '0 20px 32px -8px rgba(20,43,74,0.15)',
        'glow-accent': '0 0 24px -4px rgba(245,197,66,0.3)',
      },
    },
  },
  plugins: [],
}
