import '../styles/globals.css';
import '../styles/preflight.css';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ScopedCssBaseline from '@mui/joy/ScopedCssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBubble from '@app/components/ChatBubble';
import { theme, themeKeys } from '@app/utils/themes/chat-bubble';

document.addEventListener('DOMContentLoaded', () => {
  try {
    const me = document.querySelector(
      'script[data-name="databerry-chat-bubble"]'
    );

    if (!me?.id) {
      console.warn('[CHAINDESK]: missing Agent ID');
      return;
    }

    // const cache = createCache({
    //   key: 'chat-bubble',
    //   prepend: true,
    // });
    // const div = document.createElement('div');
    // document.body.appendChild(div);
    // const root = createRoot(div);

    // Shadow DOM alternative
    const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '';
    const div = document.createElement('div');
    const shadowContainer = div.attachShadow({ mode: 'open' });
    const remoteSyles = document.createElement('link');
    remoteSyles.setAttribute('rel', 'stylesheet');
    remoteSyles.setAttribute('type', 'text/css');
    remoteSyles.setAttribute('href', assetsBaseUrl + '/chat-bubble.css');
    const emotionRoot = document.createElement('style');
    const shadowRootElement = document.createElement('div');
    shadowContainer.appendChild(remoteSyles);
    shadowContainer.appendChild(emotionRoot);
    shadowContainer.appendChild(shadowRootElement);

    const cache = createCache({
      key: 'chat-bubble',
      prepend: true,
      // speedy: true,
      container: emotionRoot,
    });

    document.body.appendChild(div);
    const root = createRoot(shadowRootElement);

    root.render(
      <StrictMode>
        <CacheProvider value={cache}>
          <CssVarsProvider
            theme={theme}
            defaultMode="light"
            colorSchemeNode={shadowRootElement}
            {...themeKeys}
          >
            <ScopedCssBaseline>
              <ChatBubble
                agentId={me.id}
                onAgentLoaded={(agent) => {
                  const customCSS = (agent?.interfaceConfig as any)
                    ?.customCSS as string;

                  if (customCSS) {
                    const customStyle = document.createElement('style');
                    customStyle.innerHTML = customCSS;
                    shadowContainer.appendChild(customStyle);
                  }
                }}
              />
            </ScopedCssBaseline>
          </CssVarsProvider>
        </CacheProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error(error);
  }
});
