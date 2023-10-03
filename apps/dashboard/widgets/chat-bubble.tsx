import '../styles/globals.css';
import '../styles/preflight.css';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import {
  CssVarsProvider,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/joy/styles';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBubble, { theme } from '@app/components/ChatBubble';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const cache = createCache({
      key: 'chat-bubble',
      prepend: true,
      speedy: true,
    });

    const me = document.querySelector(
      'script[data-name="databerry-chat-bubble"]'
    );

    if (!me?.id) {
      console.warn('[CHAINDESK]: missing Agent ID');
      return;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    root.render(
      <StrictMode>
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
              </CssVarsProvider>
            </ThemeProvider>
          </CacheProvider>
        </StyledEngineProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error(error);
  }
});
