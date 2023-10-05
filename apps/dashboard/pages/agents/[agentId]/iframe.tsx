import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import colors from '@mui/joy/colors';
import {
  CssVarsProvider,
  extendTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/joy/styles';
import React, { ReactElement } from 'react';

import ChatBoxFrame from '@app/components/ChatBoxFrame';

export const theme = extendTheme({
  cssVarPrefix: 'chaindesk-chat-iframe',
  colorSchemes: {
    dark: {
      palette: {
        primary: colors.grey,
      },
    },
    light: {
      palette: {
        primary: colors.grey,
      },
    },
  },
});

const cache = createCache({
  key: 'chaindesk-chat-iframe',
  prepend: true,
  speedy: true,
});

const IframeTheme = (props: any) => {
  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssVarsProvider
            theme={theme}
            defaultMode="light"
            modeStorageKey="chaindesk-chat-iframe"
          >
            {props.children}
          </CssVarsProvider>
        </ThemeProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
};

function App() {
  return <ChatBoxFrame />;
}

App.getLayout = function getLayout(page: ReactElement) {
  return <IframeTheme>{page}</IframeTheme>;
};

export default App;
