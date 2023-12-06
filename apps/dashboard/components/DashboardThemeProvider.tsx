import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React from 'react';

import createEmotionCache from '@app/utils/create-emotion-cache';
import theme, { themeKeys } from '@app/utils/themes/dashboard';

const clientSideEmotionCache = createEmotionCache();

function DashboardThemeProvider(props: any) {
  const { emotionCache = clientSideEmotionCache } = props as any;

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={emotionCache}>
        <CssVarsProvider
          theme={theme}
          modeStorageKey={themeKeys.modeStorageKey}
          colorSchemeStorageKey={themeKeys.colorSchemeStorageKey}
          attribute={themeKeys.attribute}
        >
          <CssBaseline enableColorScheme />
          {props.children}
        </CssVarsProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}

export default DashboardThemeProvider;
