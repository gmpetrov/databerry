import '@chaindesk/lib/env';
import '@app/styles/globals.css';
import '@app/styles/preflight.css';
import '@app/styles/nprogress.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
import React from 'react';
import { Toaster } from 'react-hot-toast';

import DashboardThemeProvider from '@app/components/DashboardThemeProvider';
import {
  getProductFromHostname,
  ProductContext,
  ProductType,
} from '@app/hooks/useProduct';
import useUTMTracking from '@app/hooks/useUTMTracking';
import createEmotionCache from '@app/utils/create-emotion-cache';

import { NextPageWithLayout, RouteNames } from '@chaindesk/lib/types';

const clientSideEmotionCache = createEmotionCache();

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const TopProgressBar = dynamic(
  () => {
    return import('@app/components/TopProgressBar');
  },
  { ssr: false }
);

export default function App({
  Component,
  pageProps,
  ...otherProps
}: AppPropsWithLayout) {
  const router = useRouter();
  const getLayout = Component.getLayout ?? ((page) => page);
  const [product, setProduct] = React.useState<ProductType>(pageProps.product);

  useUTMTracking();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setProduct(getProductFromHostname(window.location.hostname));
    }
  }, []);

  // Redirect to new domain on front side as DNS redirect breaks some features
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.host === 'app.databerry.ai') {
        window.location.href = window.location.href.replace(
          'app.databerry.ai',
          'app.chaindesk.ai'
        );
      }
    }
  }, []);

  React.useEffect(() => {
    function onRouteChangeComplete(url: string) {
      if (process.env.NEXT_PUBLIC_GA_ID) {
        window?.gtag?.('event', 'page_view', {
          page_location: url,
        });
      }
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [router.events]);

  if (router.pathname === '/agents/[agentId]/iframe') {
    return getLayout(
      <ProductContext.Provider value={product}>
        <SessionProvider>
          <Component {...pageProps} />
        </SessionProvider>
      </ProductContext.Provider>
    );
  }

  return (
    <ProductContext.Provider value={product}>
      <DashboardThemeProvider {...otherProps}>
        <TopProgressBar />
        <SessionProvider>
          <Toaster />
          {getLayout(<Component {...pageProps} />)}
        </SessionProvider>
      </DashboardThemeProvider>
    </ProductContext.Provider>
  );
}
