/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#0a0f18',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
          dark: '#030712',
          neon: '#0ea5e9',
          danger: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          accent: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
