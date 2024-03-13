import { extendTheme } from '@mui/joy/styles';
import {
  Inter,
  Source_Code_Pro,
  Caveat,
  Bricolage_Grotesque,
} from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  adjustFontFallback: false, // prevent NextJS from adding its own fallback font
  fallback: ['var(--joy-fontFamily-fallback)'], // use Joy UI's fallback font
  display: 'swap',
});
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  display: 'swap',
  adjustFontFallback: false,
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  adjustFontFallback: false, // prevent NextJS from adding its own fallback font
  fallback: [
    // the default theme's fallback for monospace fonts
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
  display: 'swap',
});

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          // 950: '#09090b',
        },
        // primary: {
        //   50: '#FDF7FF',
        //   100: '#F4EAFF',
        //   200: '#E1CBFF',
        //   300: '#C69EFF',
        //   400: '#A374F9',
        //   500: '#814DDE',
        //   600: '#5F35AE',
        //   700: '#452382',
        //   800: '#301761',
        //   900: '#1D0A42',
        // },
      },
    },
  },
  fontFamily: {
    body: inter.style.fontFamily,
    display: bricolage.style.fontFamily,
    code: sourceCodePro.style.fontFamily,
  },

  // components: {
  //   JoyButton: {
  //     styleOverrides: {
  //       root: ({ ownerState }) => ({
  //         ...(ownerState.color === 'primary' && {
  //           backgroundColor: '#4338ca',
  //         }),
  //       }),
  //     },
  //   },
  // },
});

export default theme;
