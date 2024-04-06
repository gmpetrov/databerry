import {
  extendTheme,
  Theme as JoyTheme,
  ThemeCssVar as JoyThemeCssVar,
  ThemeVars as JoyThemeVars,
} from '@mui/joy/styles';

import {
  CommonColors,
  experimental_extendTheme as extendMuiTheme,
  Overlays,
  PaletteAlert,
  PaletteAppBar,
  PaletteAvatar,
  PaletteChip,
  PaletteColor,
  PaletteColorChannel,
  PaletteFilledInput,
  PaletteLinearProgress,
  PaletteSkeleton,
  PaletteSlider,
  PaletteSnackbarContent,
  PaletteSpeedDialAction,
  PaletteStepConnector,
  PaletteStepContent,
  PaletteSwitch,
  PaletteTableCell,
  PaletteTooltip,
  Shadows,
  TypeAction,
  TypeBackground,
  TypeText,
  ZIndex,
} from '@mui/material/styles';

import { purple } from './colors';

declare module '@mui/joy/styles' {
  interface Palette {
    secondary: PaletteColorChannel;
    error: PaletteColorChannel;
    dividerChannel: string;
    action: TypeAction;
    Alert: PaletteAlert;
    AppBar: PaletteAppBar;
    Avatar: PaletteAvatar;
    Chip: PaletteChip;
    FilledInput: PaletteFilledInput;
    LinearProgress: PaletteLinearProgress;
    Skeleton: PaletteSkeleton;
    Slider: PaletteSlider;
    SnackbarContent: PaletteSnackbarContent;
    SpeedDialAction: PaletteSpeedDialAction;
    StepConnector: PaletteStepConnector;
    StepContent: PaletteStepContent;
    Switch: PaletteSwitch;
    TableCell: PaletteTableCell;
    Tooltip: PaletteTooltip;
  }
  interface PalettePrimary extends PaletteColor {}
  interface PaletteInfo extends PaletteColor {}
  interface PaletteSuccess extends PaletteColor {}
  interface PaletteWarning extends PaletteColor {}
  interface PaletteCommon extends CommonColors {}
  interface PaletteText extends TypeText {}
  interface PaletteBackground extends TypeBackground {}

  interface ThemeVars {
    // attach to Joy UI `theme.vars`
    shadows: Shadows;
    overlays: Overlays;
    zIndex: ZIndex;
  }

  interface TypographySystemOverrides {
    kbd: true;
    display1: true;
  }

  interface FontSizeOverrides {
    xl7: true;
    xl6: true;
    xl5: true;
    xs2: true;
    xs3: true;
  }

  interface FontWeightOverrides {
    xs: true;
    xl2: true;
    xl3: true;
  }
}

export const createThemeKeys = (prefix: string = 'chaindesk') => ({
  modeStorageKey: prefix,
  colorSchemeStorageKey: `${prefix}-color-scheme`,
  attribute: `data-${prefix}`,
});

export const createTheme = (props: { container?: any; prefix?: string } = {}) =>
  extendTheme({
    cssVarPrefix: props.prefix,
    fontFamily: {
      body: 'Inter, sans-serif',
      display: 'Bricolage Grotesque, sans-serif',
      // body: inter.style.fontFamily,
      // display: bricolage.style.fontFamily,
      // code: sourceCodePro.style.fontFamily,
    },

    typography: {
      display1: {
        // `--joy` is the default CSS variable prefix.
        // If you have a custom prefix, you have to use it instead.
        // For more details about the custom prefix, go to https://mui.com/joy-ui/customization/using-css-variables/#custom-prefix
        background:
          'linear-gradient(-30deg, var(--joy-palette-primary-900), var(--joy-palette-primary-400))',
        // `Webkit*` properties must come later.
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '57px',
        lineHeight: '64px',
        letterSpacing: '-0.25px',
      },
      kbd: {
        background:
          'linear-gradient(to top, var(--joy-palette-background-level2), var(--joy-palette-background-surface))',
        border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
        borderRadius: 'var(--joy-radius-xs)',
        boxShadow: 'var(--joy-shadow-sm)',
        padding: '0.125em 0.375em',
      },
    },

    fontSize: {
      xl7: '4.5rem',
      xl6: '3.75rem',
      xl5: '3rem',
      xs2: '0.625rem',
      xs3: '0.5rem',
    },
    fontWeight: {
      xs: 200,
      xl2: 800,
      xl3: 900,
    },
    components: {
      JoySelect: {
        defaultProps: {
          slotProps: {
            listbox: {
              container: props.container,
            },
          },
        },
        styleOverrides: {
          root: (t) => ({
            borderRadius: t.theme.radius.sm,
          }),
        },
      },
      JoyModal: {
        defaultProps: {
          container: props.container,
        },
      },
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
          neutral: {
            solidBg: '#000',
          },
        },
      },
    },
  });
