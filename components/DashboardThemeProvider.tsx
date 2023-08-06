import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/joy/CssBaseline';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React from 'react';

import createEmotionCache from '@app/utils/create-emotion-cache';
import theme from '@app/utils/theme';

const clientSideEmotionCache = createEmotionCache();

function DashboardThemeProvider(props: any) {
  const { emotionCache = clientSideEmotionCache } = props as any;

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={emotionCache}>
        <CssVarsProvider
          theme={theme}
          defaultMode="dark"
          modeStorageKey="chaindesk-dashboard-mode"
          colorSchemeStorageKey="chaindesk-dashboard-color-scheme"
          attribute="chaindesk-dashboard-color-scheme"
        >
          <CssBaseline enableColorScheme />
          {props.children}
        </CssVarsProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}

export default DashboardThemeProvider;
