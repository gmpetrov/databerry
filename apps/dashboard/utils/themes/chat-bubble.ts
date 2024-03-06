import { extendTheme } from '@mui/joy/styles';

import { purple } from './colors';

export const themeKeys = {
  modeStorageKey: 'databerry-chat-bubble',
  colorSchemeStorageKey: 'databerry-chat-bubble-scheme',
  attribute: 'data-databerry-chat-bubble',
};

export const theme = extendTheme({
  cssVarPrefix: 'databerry-chat-bubble',
  fontFamily: {
    body: 'Inter, sans-serif',
    display: 'Bricolage Grotesque, sans-serif',
  },

  components: {
    JoyCard: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
        }),
      },
    },
    JoyInput: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
        }),
      },
    },
    JoyTextarea: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
        }),
      },
    },
    JoyButton: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
        }),
      },
    },
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: purple,
      },
    },
    light: {
      palette: {
        primary: purple,
      },
    },
  },
});
