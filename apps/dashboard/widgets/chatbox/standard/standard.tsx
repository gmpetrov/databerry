import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import {
  Box,
  CssBaseline,
  CssVarsProvider,
  StyledEngineProvider,
} from '@mui/joy';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import ChatBoxFrame from '@app/components/ChatBoxFrame';
import { theme, themeKeys } from '@app/utils/themes/chat-bubble';

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '';

class WebChatBoxFrame extends HTMLElement {
  root: Root;
  cssProvider = assetsBaseUrl + '/styles.css';
  shadowRootElement: HTMLDivElement;
  cache: EmotionCache;
  constructor() {
    super();

    const remoteFonts = document.createElement('link');
    remoteFonts.setAttribute('rel', 'stylesheet');
    remoteFonts.setAttribute('type', 'text/css');
    remoteFonts.setAttribute(
      'href',
      'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap'
    );

    const remoteSyles = document.createElement('link');
    remoteSyles.setAttribute('rel', 'stylesheet');
    remoteSyles.setAttribute('type', 'text/css');
    remoteSyles.setAttribute('href', this.cssProvider);

    this.shadowRootElement = document.createElement('div');
    this.shadowRootElement.id = 'standard-root';

    const shadowContainer = this.attachShadow({ mode: 'open' });
    this.root = createRoot(this.shadowRootElement);
    const emotionRoot = document.createElement('style');
    shadowContainer.appendChild(remoteFonts);
    shadowContainer.appendChild(remoteSyles);
    shadowContainer.appendChild(emotionRoot);
    shadowContainer.appendChild(this.shadowRootElement);

    this.cache = createCache({
      key: 'chat-bubble',
      prepend: true,
      container: emotionRoot,
    });

    this.root = createRoot(this.shadowRootElement);
  }

  connectedCallback() {
    this.root.render(
      <StyledEngineProvider injectFirst>
        <CacheProvider value={this.cache}>
          <CssVarsProvider theme={theme} defaultMode="light" {...themeKeys}>
            <CssBaseline enableColorScheme />

            <ChatBoxFrame
              agentId={this.getAttribute('agent-id')!}
              styles={
                this.getAttribute('styles')
                  ? JSON.parse(this.getAttribute('styles')!)
                  : {}
              }
            />
          </CssVarsProvider>
        </CacheProvider>
      </StyledEngineProvider>
    );
  }
}

customElements.define('chat-box', WebChatBoxFrame);

export default WebChatBoxFrame;
