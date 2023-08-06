import '../styles/globals.css';
import '../styles/preflight.css';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import {
  CssVarsProvider,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/joy/styles';
import { SessionProvider } from 'next-auth/react';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBubble, { theme } from '@app/components/ChatBubble';

if (typeof window !== 'undefined') {
  addEventListener('DOMContentLoaded', (event) => {
    const cache = createCache({
      key: 'chat-bubble',
      prepend: true,
      speedy: true,
    });

    const me = document.querySelector(
      'script[data-name="databerry-chat-bubble"]'
    );
    if (!me?.id) {
      return;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <StrictMode>
        <SessionProvider>
          <StyledEngineProvider injectFirst>
            <CacheProvider value={cache}>
              <ThemeProvider theme={theme}>
                <CssVarsProvider
                  theme={theme}
                  defaultMode="light"
                  modeStorageKey="databerry-chat-bubble"
                  colorSchemeStorageKey="databerry-chat-bubble-scheme"
                  attribute="databerry-chat-bubble-scheme"
                  colorSchemeNode={div}
                >
                  <ChatBubble agentId={me.id} />
                  {/* <ChatBubble agentId={'clgqxreyd0000ya0u5hb560qs'} /> */}
                </CssVarsProvider>
              </ThemeProvider>
            </CacheProvider>
          </StyledEngineProvider>
        </SessionProvider>
      </StrictMode>
    );
  });
}
