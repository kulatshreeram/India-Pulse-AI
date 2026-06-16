import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        saffron: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        glass: {
          light: 'rgba(255,255,255,0.08)',
          dark:  'rgba(0,0,0,0.35)',
          border: 'rgba(255,255,255,0.12)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(251,146,60,0.15), transparent)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'ticker': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(251,146,60,0.4)' },
          '50%':      { boxShadow: '0 0 20px rgba(251,146,60,0.8), 0 0 40px rgba(251,146,60,0.4)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'counter': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring':     'pulse-ring 2s ease-out infinite',
        'float':          'float 3s ease-in-out infinite',
        'ticker':         'ticker 30s linear infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in-up':     'fade-in-up 0.4s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass':    '0 8px 32px 0 rgba(0,0,0,0.37)',
        'glow-sm':  '0 0 10px rgba(251,146,60,0.3)',
        'glow-md':  '0 0 20px rgba(251,146,60,0.4)',
        'glow-lg':  '0 0 40px rgba(251,146,60,0.3)',
        'card':     '0 4px 24px rgba(0,0,0,0.4)',
        'panel':    '0 25px 50px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
