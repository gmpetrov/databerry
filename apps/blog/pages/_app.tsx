import 'styles/global.css';
// import '@chaindesk/ui/styles/globals.css'
// import '@chaindesk/ui/styles/preflight.css'
// global styles shared across the entire site
// used for rendering equations (optional)
import 'katex/dist/katex.min.css';
// used for code syntax highlighting (optional)
import 'prismjs/themes/prism-coy.css';
// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
// this might be better for dark mode
// import 'prismjs/themes/prism-okaidia.css'
// global style overrides for notion
import 'styles/notion.css';
// global style overrides for prism theme (optional)
import 'styles/prism-theme.css';

import * as Fathom from 'fathom-client';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';
import * as React from 'react';

import theme from '@chaindesk/ui/themes/dashboard';
import ThemeProvider from '@chaindesk/ui/themes/provider';

import { bootstrap } from '@/lib/bootstrap-client';
import {
  fathomConfig,
  fathomId,
  isServer,
  posthogConfig,
  posthogId,
} from '@/lib/config';

if (!isServer) {
  bootstrap();
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  React.useEffect(() => {
    function onRouteChangeComplete() {
      if (fathomId) {
        Fathom.trackPageview();
      }

      if (posthogId) {
        posthog.capture('$pageview');
      }
    }

    if (fathomId) {
      Fathom.load(fathomId, fathomConfig);
    }

    if (posthogId) {
      posthog.init(posthogId, posthogConfig);
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [router.events]);

  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
