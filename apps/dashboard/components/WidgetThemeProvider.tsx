import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import React from 'react';

import { purple } from '@app/utils/themes/colors';

function WidgetThemeProvider(
  props: any & {
    name?: string;
  }
) {
  const { emotionCache, name = 'widget' } = props as any;

  const cache =
    emotionCache ||
    createCache({
      key: `${name}-cache`,
      prepend: true,
      speedy: true,
    });

  const t = React.useMemo(() => {
    return extendTheme({
      cssVarPrefix: name,
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
  }, [name]);

  return (
    // <StyledEngineProvider injectFirst>
    <CacheProvider value={cache}>
      <CssVarsProvider
        theme={t}
        defaultMode="light"
        modeStorageKey={`${name}-mode`}
        colorSchemeStorageKey={`${name}-color-scheme`}
        attribute={`${name}-attribute`}
        disableNestedContext
      >
        <CssBaseline enableColorScheme />
        {props.children}
      </CssVarsProvider>
    </CacheProvider>
    // </StyledEngineProvider>
  );
}

export default WidgetThemeProvider;
