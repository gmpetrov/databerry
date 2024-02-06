import createCache, { EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssVarsProvider, ScopedCssBaseline } from '@mui/joy';
import React, { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';

import BlablaFormLoader from '@app/components/BlablaFormLoader';
import { theme, themeKeys } from '@app/utils/themes/blablaform';

export const name = 'chaindesk-form';

const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL || '';

export default class WebBlablaForm extends HTMLElement {
  cssProvider = assetsBaseUrl + '/dist/form/styles.css';
  root: Root;
  cache: EmotionCache;
  shadowRootElement: HTMLDivElement;

  constructor() {
    super();

    const shadowContainer = this.attachShadow({ mode: 'open' });
    const remoteSyles = document.createElement('link');
    remoteSyles.setAttribute('rel', 'stylesheet');
    remoteSyles.setAttribute('type', 'text/css');
    remoteSyles.setAttribute('href', this.cssProvider);
    const remoteFonts = document.createElement('link');
    remoteFonts.setAttribute('rel', 'stylesheet');
    remoteFonts.setAttribute('type', 'text/css');
    remoteFonts.setAttribute(
      'href',
      'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap'
    );

    shadowContainer.appendChild(remoteFonts);
    shadowContainer.appendChild(remoteSyles);

    const emotionRoot = document.createElement('style');
    this.shadowRootElement = document.createElement('div');

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
              <BlablaFormLoader formId={this.getAttribute('id')!} />
            </ScopedCssBaseline>
          </CssVarsProvider>
        </CacheProvider>
      </StrictMode>
    );
  }
}
