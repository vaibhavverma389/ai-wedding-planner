/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#F8F4EE',
          200: '#EFE8DC',
          300: '#E3D7C5',
          400: '#CDBEAA'
        },
        maroon: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          950: '#4C0519'
        },
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'wedding': '0 4px 20px -2px rgba(136, 19, 55, 0.08), 0 2px 6px -1px rgba(136, 19, 55, 0.04)',
        'wedding-lg': '0 10px 30px -4px rgba(136, 19, 55, 0.12), 0 4px 12px -2px rgba(136, 19, 55, 0.06)'
      }
    },
  },
  plugins: [],
};
