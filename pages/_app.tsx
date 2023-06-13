import '@app/utils/env';
import '@app/styles/globals.css';
import '@app/styles/preflight.css';
import '@app/styles/nprogress.css';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_MAINTENANCE === 'true' &&
      router.route !== RouteNames.MAINTENANCE &&
      router.route !== '/'
    ) {
      router.push(RouteNames.MAINTENANCE);
    }
  }, []);

  if (router.pathname === '/agents/[agentId]/iframe') {
    return getLayout(<Component {...pageProps} />);
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
