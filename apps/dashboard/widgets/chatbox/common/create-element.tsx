import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ScopedCssBaseline from '@mui/joy/ScopedCssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import React, { FunctionComponent, StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { CustomContact } from '@app/hooks/useChat';
import { theme, themeKeys } from '@app/utils/themes/chat-bubble';

import { InitWidgetProps } from './types';

const contactAttributes = {
  'phone-number': 'phoneNumber',
  'user-id': 'userId',
  'first-name': 'firstName',
  'last-name': 'lastName',
  email: 'email',
};

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '';

type Props = {
  name: string;
  widget: FunctionComponent<InitWidgetProps>;
};

const createElement = ({ name, widget }: Props) =>
  class WebChatBubble extends HTMLElement {
    cssProvider = assetsBaseUrl + '/dist/chatbox/styles.css';
    root: Root;
    cache: EmotionCache;
    shadowRootElement: HTMLDivElement;
    instanceId?: string;

    destroy() {
      this.innerHTML = '';
      if (this.instanceId) {
        (window as any)[this.instanceId!] = null;
      }
    }

    constructor(props: { instanceId?: string }) {
      super();
      this.instanceId = props?.instanceId;
      const shadowContainer = this.attachShadow({ mode: 'open' });

      const remoteFonts = document.createElement('link');
      remoteFonts.setAttribute('rel', 'stylesheet');
      remoteFonts.setAttribute('type', 'text/css');
      remoteFonts.setAttribute(
        'href',
        'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@100..900&display=swap'
      );

      const remoteSyles = document.createElement('link');
      remoteSyles.setAttribute('rel', 'stylesheet');
      remoteSyles.setAttribute('type', 'text/css');
      remoteSyles.setAttribute('href', this.cssProvider);

      const emotionRoot = document.createElement('style');
      this.shadowRootElement = document.createElement('div');
      shadowContainer.appendChild(remoteFonts);
      shadowContainer.appendChild(remoteSyles);
      shadowContainer.appendChild(emotionRoot);
      shadowContainer.appendChild(this.shadowRootElement);

      this.cache = createCache({
        key: name,
        prepend: true,
        container: emotionRoot,
      });

      this.root = createRoot(this.shadowRootElement);
    }

    connectedCallback() {
      const contact = Object.entries(contactAttributes).reduce(
        (obj, [attr, propName]) => {
          const value = this.getAttribute(attr);
          if (value) {
            obj[propName as keyof CustomContact] = value;
          }
          return obj;
        },
        {} as CustomContact
      );

      const context = this.getAttribute('context') as string;
      let initConfig = {} as InitWidgetProps['initConfig'];

      try {
        initConfig = JSON.parse(
          this.getAttribute('interface')!
        ) as InitWidgetProps['initConfig'];
      } catch {}

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
                {React.createElement(widget, {
                  initConfig,
                  context,
                  agentId: this.getAttribute('agent-id') || '',
                  contact: contact,
                  styles: this.getAttribute('styles')
                    ? JSON.parse(this.getAttribute('styles')!)
                    : {},

                  onAgentLoaded: (agent: any) => {
                    const customCSS = (agent?.interfaceConfig as any)
                      ?.customCSS as string;

                    if (customCSS) {
                      const customStyle = document.createElement('style');
                      customStyle.innerHTML = customCSS;
                      this.shadowRootElement.appendChild(customStyle);
                    }
                  },
                } as InitWidgetProps)}
              </ScopedCssBaseline>
            </CssVarsProvider>
          </CacheProvider>
        </StrictMode>
      );
    }
  };

export default createElement;
