/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        goa: {
          darkest: '#030F09',
          dark: '#071B12',
          bg: '#0A2318',
          card: '#0F3223',
          panel: '#0C281C',
          border: 'rgba(243, 192, 72, 0.22)',
        },
        gold: {
          light: '#FFE596',
          DEFAULT: '#F3C048',
          warm: '#E5A93C',
          dark: '#B88220',
        },
        saffron: {
          DEFAULT: '#E86A23',
          light: '#FA8C43',
        },
        magenta: {
          DEFAULT: '#D93B78',
          light: '#FF5C93',
        },
        cream: {
          DEFAULT: '#FBF8EF',
          muted: '#C5D9CB',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
