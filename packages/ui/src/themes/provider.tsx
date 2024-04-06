import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React, { useMemo } from 'react';
import { createThemeKeys } from './base';

export type ThemeProviderProps = {
  prefix?: string;
  container?: any;
  emotionCache?: any;
  theme?: any;
  children: React.ReactNode;
  disableNestedContext?: boolean;
  defaultMode?: 'light' | 'dark';
};

function ThemeProvider(props: ThemeProviderProps) {
  const { emotionCache } = props as any;

  const cache = useMemo(() => {
    return (
      emotionCache ||
      createCache({
        key: props.prefix || 'css',
        prepend: true,
        container: props.container,
      })
    );
  }, [emotionCache]);

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={cache}>
        <CssVarsProvider
          theme={props.theme}
          defaultMode={props.defaultMode}
          disableNestedContext={props.disableNestedContext}
          {...createThemeKeys(props.prefix)}
        >
          <CssBaseline enableColorScheme />
          {props.children}
        </CssVarsProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}

export default ThemeProvider;
