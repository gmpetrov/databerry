import "@app/utils/env";
import "@app/styles/globals.css";
import "@app/styles/preflight.css";
import "@app/styles/nprogress.css";

import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider, StyledEngineProvider } from "@mui/joy/styles";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import router from "next/router";
import { SessionProvider } from "next-auth/react";
import { NextIntlProvider } from "next-intl";
import { useEffect } from "react";

import { NextPageWithLayout, RouteNames } from "@app/types";
import createEmotionCache from "@app/utils/create-emotion-cache";
import theme from "@app/utils/theme";

const clientSideEmotionCache = createEmotionCache();

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const TopProgressBar = dynamic(
  () => {
    return import("@app/components/TopProgressBar");
  },
  { ssr: false }
);

export default function App({
  Component,
  pageProps,
  ...otherProps
}: AppPropsWithLayout) {
  const { emotionCache = clientSideEmotionCache } = otherProps as any;

  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_MAINTENANCE === "true" &&
      router.route !== RouteNames.MAINTENANCE &&
      router.route !== "/"
    ) {
      router.push(RouteNames.MAINTENANCE);
    }
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={emotionCache}>
        <CssVarsProvider theme={theme} defaultMode="dark">
          <CssBaseline enableColorScheme />
          <TopProgressBar />
          <SessionProvider>
            <NextIntlProvider messages={pageProps.messages}>
              {getLayout(<Component {...pageProps} />)}
            </NextIntlProvider>
            <Analytics />
          </SessionProvider>
        </CssVarsProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
}
