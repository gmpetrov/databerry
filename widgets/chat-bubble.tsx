import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBubble, { theme } from '@app/components/ChatBubble';

const cache = createCache({ key: 'chat-bubble', prepend: true });

if (typeof window !== 'undefined') {
  addEventListener('DOMContentLoaded', (event) => {
    const me = document.querySelector('script[data-name="databerry-widget"]');
    console.log('CALLLED ------------->', me?.id);
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <StrictMode>
        <StyledEngineProvider injectFirst>
          <CacheProvider value={cache}>
            <CssVarsProvider theme={theme} defaultMode="light">
              <ChatBubble agentId={'clgqxreyd0000ya0u5hb560qs'} />
            </CssVarsProvider>
          </CacheProvider>
        </StyledEngineProvider>
      </StrictMode>
    );
  });
}
