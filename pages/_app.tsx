import '@app/utils/env';
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
import useUTMTracking from '@app/hooks/useUTMTracking';
import { NextPageWithLayout, RouteNames } from '@app/types';
import createEmotionCache from '@app/utils/create-emotion-cache';

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

  useUTMTracking();

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

  if (router.pathname === '/agents/[agentId]/iframe') {
    return getLayout(
      <SessionProvider>
        <Component {...pageProps} />
      </SessionProvider>
    );
  }

  return (
    <DashboardThemeProvider {...otherProps}>
      <TopProgressBar />
      <SessionProvider>
        <Toaster />
        {getLayout(<Component {...pageProps} />)}
      </SessionProvider>
    </DashboardThemeProvider>
  );
}
