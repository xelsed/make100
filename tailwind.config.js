/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        base: '#08090d',
        surface: {
          DEFAULT: '#0f1117',
          raised: '#171b26',
          hover: '#1c2132',
        },
        lime: {
          DEFAULT: '#a3e635',
          dim: '#65a30d',
          bright: '#d9f99d',
          glow: 'rgba(163, 230, 53, 0.15)',
        },
        accent: {
          DEFAULT: '#a3e635',
          secondary: '#818cf8',
        },
        warm: {
          DEFAULT: '#fbbf24',
          dim: '#b45309',
        },
        txt: {
          DEFAULT: '#f0eeeb',
          secondary: '#6b6f7b',
          muted: '#464a55',
        },
        border: 'rgba(255,255,255,0.06)',
        success: '#34d399',
        danger: '#f87171',
        brand: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(163, 230, 53, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(163, 230, 53, 0.15)' },
        },
      },
    },
  },
  plugins: [],
}
