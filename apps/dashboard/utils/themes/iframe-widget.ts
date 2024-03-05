import { extendTheme } from '@mui/joy/styles';

import { purple } from './colors';

export const themeKeys = {
  modeStorageKey: 'app-iframe-mode',
  colorSchemeStorageKey: 'app-iframe-color-scheme',
  attribute: 'data-app-iframe-mode',
};

export const theme = extendTheme({
  cssVarPrefix: 'chaindesk-chat-iframe',
  fontFamily: {
    body: 'Inter, sans-serif',
    display: 'Bricolage Grotesque, sans-serif',
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
