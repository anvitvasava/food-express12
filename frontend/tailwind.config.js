/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#ff6b35', // swathes of swiggy orange / zomato red
          DEFAULT: '#ff4d00',
          dark: '#e03e00',
        },
        premium: {
          gold: '#dfb76c',
          darkBg: '#0b0f19',
          cardDark: 'rgba(20, 26, 44, 0.7)',
          borderDark: 'rgba(255, 255, 255, 0.08)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      }
    },
  },
  plugins: [],
}
