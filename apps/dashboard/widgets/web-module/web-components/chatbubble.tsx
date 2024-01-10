import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ScopedCssBaseline from '@mui/joy/ScopedCssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import React, { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';

import ChatBubble from '@app/components/ChatBubble';
import { theme, themeKeys } from '@app/utils/themes/chat-bubble';

class WebChatBubble extends HTMLElement {
  cssProvider =
    (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '') + '/chat-bubble.css';
  root: Root;
  cache: EmotionCache;
  shadowRootElement: HTMLDivElement;

  static get observedAttributes() {
    return [`agent-id`, `on-marked-as-resolved`];
  }

  constructor() {
    super();
    const shadowContainer = this.attachShadow({ mode: 'open' });

    const remoteSyles = document.createElement('link');
    remoteSyles.setAttribute('rel', 'stylesheet');
    remoteSyles.setAttribute('type', 'text/css');
    remoteSyles.setAttribute('href', this.cssProvider);

    const emotionRoot = document.createElement('style');
    this.shadowRootElement = document.createElement('div');
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
      <StrictMode>
        <CacheProvider value={this.cache}>
          <CssVarsProvider
            theme={theme}
            defaultMode="light"
            colorSchemeNode={this.shadowRootElement}
            {...themeKeys}
          >
            <ScopedCssBaseline>
              <ChatBubble
                agentId={this.getAttribute('agent-id') || ''}
                onMarkedAsResolved={window?.onMarkedAsResolved}
              />
            </ScopedCssBaseline>
          </CssVarsProvider>
        </CacheProvider>
      </StrictMode>
    );
  }
}

customElements.define('web-chat-bubble', WebChatBubble);

export default WebChatBubble;
