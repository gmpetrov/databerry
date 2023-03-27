import '@app/utils/env';
import '@app/styles/globals.css';
import '@app/styles/preflight.css';
import '@app/styles/nprogress.css';

import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/joy';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { SessionProvider } from 'next-auth/react';

import { NextPageWithLayout } from '@app/types';
import createEmotionCache from '@app/utils/create-emotion-cache';
import theme from '@app/utils/theme';

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
  const { emotionCache = clientSideEmotionCache } = otherProps as any;

  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push(RouteNames.SIGN_IN);
  //   }
  // }, [status]);

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={emotionCache}>
        <CssVarsProvider theme={theme} defaultMode="dark">
          <CssBaseline enableColorScheme />
          <TopProgressBar />
          <SessionProvider>
            {getLayout(<Component {...pageProps} />)}
          </SessionProvider>
        </CssVarsProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}
