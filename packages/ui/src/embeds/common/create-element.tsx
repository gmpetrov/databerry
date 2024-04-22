import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ScopedCssBaseline from '@mui/joy/ScopedCssBaseline';
import { CssVarsProvider } from '@mui/joy/styles';
import React, { FunctionComponent, StrictMode, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { ChatboxEvent, CustomContact } from '@chaindesk/lib/types';
import { InitWidgetProps } from '@chaindesk/ui/embeds/types';
import { createTheme, createThemeKeys } from '@chaindesk/ui/themes/base';

import '@chaindesk/ui/styles/globals.css';
import '@chaindesk/ui/styles/preflight.css';

const contactAttributes = {
  'phone-number': 'phoneNumber',
  'user-id': 'userId',
  'first-name': 'firstName',
  'last-name': 'lastName',
  email: 'email',
};

const themePrefix = 'chaindesk-embeds';
const themeKeys = createThemeKeys(themePrefix);

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '';

type Props = {
  type: 'chatbox' | 'form';
  name: string;
  widget: FunctionComponent<InitWidgetProps>;
  onEnd?: (data: any) => void;
};

const createElement = ({ name, widget, type }: Props) =>
  class WebChatBubble extends HTMLElement {
    cssProvider = assetsBaseUrl + `/dist/${type}/index.css`;
    root: Root;
    cache: EmotionCache;
    shadowRootElement: HTMLDivElement;
    instanceId?: string;
    setIsOpen?: (isOpen: boolean) => void;
    isOpen?: boolean;
    onEnd?: (data: any) => void;

    destroy() {
      this.innerHTML = '';
      if (this.instanceId) {
        (window as any)[this.instanceId!] = null;
      }
    }

    constructor(props: { instanceId?: string; onEnd?: any }) {
      super();
      this.instanceId = props?.instanceId;
      this.onEnd = props?.onEnd;
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

    open() {
      this.setIsOpen?.(true);
    }
    close() {
      this.setIsOpen?.(false);
    }

    toggle() {
      this.setIsOpen?.(!this.isOpen);
    }

    createNewConversation() {
      this.dispatchEvent(
        new Event(ChatboxEvent.CREATE_NEW_CONVERSATION, {
          bubbles: true,
          composed: true,
        })
      );
    }

    Component = (props: any) => {
      const [isOpen, setIsOpen] = useState(false);
      this.setIsOpen = setIsOpen;
      this.isOpen = isOpen;

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

      return (
        <StrictMode>
          <CacheProvider value={this.cache}>
            <CssVarsProvider
              theme={createTheme({
                container: this.shadowRootElement,
                prefix: themePrefix,
              })}
              defaultMode="light"
              colorSchemeNode={this.shadowRootElement}
              {...themeKeys}
            >
              <ScopedCssBaseline sx={{ background: 'transparent' }}>
                {React.createElement(widget, {
                  ...props,
                  isOpen,
                  onEnd: this.onEnd,
                  initConfig,
                  context,
                  agentId: this.getAttribute('agent-id') || '',
                  formId: this.getAttribute('form-id') || '',
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
    };

    connectedCallback() {
      this.root.render(
        <this.Component isOpen={this.isOpen} onEnd={this.onEnd} />
      );
    }
  };

export default createElement;
