const defaultTheme = require('tailwindcss/defaultTheme');
const svgToDataUri = require('mini-svg-data-uri');

const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
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
      animation: {
        typewriterCursor: 'typewriterCursor 1s infinite',
        spotlight: 'spotlight 2s ease .75s 1 forwards',
        shimmer: 'shimmer 2s linear infinite',

        float: 'float 3s ease-in-out infinite',

        'infinite-scroll': 'infinite-scroll 60s linear infinite',
        'infinite-scroll-inverse':
          'infinite-scroll-inverse 60s linear infinite',
      },
      keyframes: {
        typewriterCursor: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
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
        shimmer: {
          from: {
            backgroundPosition: '0 0',
          },
          to: {
            backgroundPosition: '-200% 0',
          },
        },
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
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    addVariablesForColors,
    backgrounds,
  ],
  corePlugins: {
    preflight: false,
  },
};

function addVariablesForColors({ addBase, theme }) {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
}

function backgrounds({ matchUtilities, theme }) {
  return matchUtilities(
    {
      'bg-grid': (value) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
        )}")`,
      }),
      'bg-grid-small': (value) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
        )}")`,
      }),
      'bg-dot': (value) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
        )}")`,
      }),
    },
    { values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
  );
}
