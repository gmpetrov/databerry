const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        inter: ['var(--font-inter)', 'sans-serif'],
        'inter-tight': ['var(--font-bricolage-grotesque)', 'sans-serif'],
        'bricolage-grotesque': [
          'var(--font-bricolage-grotesque)',
          'sans-serif',
        ],
        caveat: ['var(--font-caveat)', 'sans-serif'],
        title: ['var(--font-bricolage-grotesque)', 'sans-serif'],
        label: ['var(--font-caveat)', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5715' }],
        base: ['1rem', { lineHeight: '1.5', letterSpacing: '-0.017em' }],
        lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.017em' }],
        xl: ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.017em' }],
        '2xl': ['1.5rem', { lineHeight: '1.415', letterSpacing: '-0.017em' }],
        '3xl': ['2rem', { lineHeight: '1.3125', letterSpacing: '-0.017em' }],
        '4xl': ['2.5rem', { lineHeight: '1.25', letterSpacing: '-0.017em' }],
        '5xl': ['3.25rem', { lineHeight: '1.2', letterSpacing: '-0.017em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1666', letterSpacing: '-0.017em' }],
        '7xl': ['4.5rem', { lineHeight: '1.1666', letterSpacing: '-0.017em' }],
      },
      animation: {
        float: 'float 3s ease-in-out infinite',

        spotlight: 'spotlight 2s ease .75s 1 forwards',
        'infinite-scroll': 'infinite-scroll 60s linear infinite',
        'infinite-scroll-inverse':
          'infinite-scroll-inverse 60s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5%)' },
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'infinite-scroll-inverse': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        spotlight: {
          '0%': {
            opacity: 0,
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%,-40%) scale(1)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
  // important: '#__next',
};
