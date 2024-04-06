import {
  extendTheme as extendJoyTheme,
  FontSize,
  Theme as JoyTheme,
  ThemeCssVar as JoyThemeCssVar,
  ThemeVars as JoyThemeVars,
} from '@mui/joy/styles';
import { experimental_extendTheme as extendMuiTheme } from '@mui/material/styles';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { deepmerge } from '@mui/utils';

import { purple } from './colors';
import { createTheme, createThemeKeys } from './base';

type MergedThemeCssVar = { [k in JoyThemeCssVar]: true };

declare module '@mui/material/styles' {
  interface Theme {
    // put everything back to Material UI `theme.vars`
    vars: JoyTheme['vars'];
  }

  // makes Material UI theme.getCssVar() sees Joy theme tokens
  interface ThemeCssVarOverrides extends MergedThemeCssVar {}
}

declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsSizeOverrides extends Record<keyof FontSize, true> {}

  interface SvgIconPropsColorOverrides {
    danger: true;
    neutral: true;
  }
}

// const primary = {
//   50: '#ede7f6',
//   100: '#d1c4e9',
//   200: '#b39ddb',
//   300: '#9575cd',
//   400: '#7e57c2',
//   500: '#673ab7',
//   600: '#5e35b1',
//   700: '#512da8',
//   800: '#4527a0',
//   900: '#311b92',
//   // 50: '#FAFFFE',
//   // 100: '#E6FFFA',
//   // 200: '#B3FEEF',
//   // 300: '#72FEE2',
//   // 400: '#04F5C6',
//   // 500: '#04DDB2',
//   // 600: '#03B491',
//   // 700: '#069377',
//   // 800: '#0B6B58',
//   // 900: '#084A3D',
// };

const muiTheme = extendMuiTheme({
  cssVarPrefix: 'joy',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          // main: colors.blue[500],
          ...purple,
        },
      },
    },
    dark: {
      palette: {
        primary: {
          ...purple,
        },
      },
    },
  },
});

export const THEME_PREFIX = 'chaindesk-dashboard';

export const themeKeys = createThemeKeys(THEME_PREFIX);

const joyTheme = createTheme({ prefix: THEME_PREFIX });

const mergedTheme = {
  ...muiTheme,
  ...joyTheme,
  colorSchemes: deepmerge(muiTheme.colorSchemes, joyTheme.colorSchemes),
  typography: {
    ...muiTheme.typography,
    ...joyTheme.typography,
  },
} as unknown as ReturnType<typeof extendJoyTheme>;

mergedTheme.generateCssVars = (colorScheme) => ({
  css: {
    ...muiTheme.generateCssVars(colorScheme).css,
    ...joyTheme.generateCssVars(colorScheme).css,
  },
  vars: deepmerge(
    muiTheme.generateCssVars(colorScheme).vars,
    joyTheme.generateCssVars(colorScheme).vars
  ) as unknown as JoyThemeVars,
});
mergedTheme.unstable_sxConfig = {
  ...muiTheme.unstable_sxConfig,
  ...joyTheme.unstable_sxConfig,
};

export default mergedTheme;
