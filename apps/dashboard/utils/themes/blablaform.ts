import { extendTheme } from '@mui/joy/styles';

import { purple } from './colors';

export const themeKeys = {
  modeStorageKey: 'chaindesk-form',
  colorSchemeStorageKey: 'chaindesk-form-scheme',
  attribute: 'data-chaindesk-form',
};

export const theme = extendTheme({
  cssVarPrefix: 'chaindesk-form',
  fontFamily: {
    body: 'Josefin Sans, sans-serif',
    display: 'Josefin Sans, sans-serif',
  },
  components: {
    JoyInput: {
      styleOverrides: {
        root: (t) => ({
          borderRadius: t.theme.radius.sm,
          fontFamily: t.theme.fontFamily.body,
          fontWeight: 500,
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
