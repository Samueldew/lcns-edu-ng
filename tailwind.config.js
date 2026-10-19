/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a4d2e', // Labe deep green
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#0a4d2e',
          600: '#083f25',
          700: '#06321e',
          800: '#042315',
          900: '#02160d',
        },
        secondary: {
          DEFAULT: '#16a34a', // Labe green
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        accent: {
          DEFAULT: '#ca8a04', // Labe yellow / gold
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        yellow: {
          DEFAULT: '#ca8a04',
          500: '#eab308',
          600: '#ca8a04',
        },
        'lcns-green': '#16a34a',
        'lcns-deep-green': '#0a4d2e',
        'lcns-yellow': '#ca8a04',
      }
    }
  },
  plugins: [],
}
