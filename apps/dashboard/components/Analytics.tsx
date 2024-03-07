import * as Fathom from 'fathom-client';
import mixpanel from 'mixpanel-browser';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import React, { createContext, useEffect } from 'react';

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  });
}

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: true,
    track_pageview: true,
    persistence: 'localStorage',
  });
}

type AnalyticsContext = {
  capture?: (props: {
    event: string;
    payload?: Record<string, unknown>;
  }) => any;
};

export const AnalyticsContext = createContext<AnalyticsContext>({});

type Props = {
  children?: any;
  userId?: string;
};

function Analytics({ children, userId }: Props) {
  const router = useRouter();

  const capture = React.useCallback(
    (data: { event: string; payload?: Record<string, unknown> }) => {
      try {
        if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
          posthog.capture(data.event, data.payload);
        }

        if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
          mixpanel.track(data.event, data.payload);
        }

        if (process.env.NEXT_PUBLIC_GA_ID && window?.gtag) {
          window?.gtag?.('event', data.event, data.payload);
        }

        if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) {
          (window as any)?.fbq?.('track', data.event, data.payload);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [posthog, mixpanel]
  );

  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_FATHOM_SITE_ID) {
      Fathom.load(process.env.NEXT_PUBLIC_FATHOM_SITE_ID, {
        includedDomains: [
          'www.chaindesk.ai',
          'app.chaindesk.ai',
          'www.resolveai.io',
          'www.chatbotgpt.ai',
        ],
      });
    }

    function onRouteChangeComplete(url: string) {
      if (process.env.NEXT_PUBLIC_GA_ID) {
        window?.gtag?.('event', 'page_view', {
          page_location: url,
        });
      }

      if (process.env.NEXT_PUBLIC_FATHOM_SITE_ID) {
        Fathom.trackPageview();
      }

      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog?.capture('$pageview');
      }

      if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) {
        (window as any)?.fbq?.('track', 'PageView');
      }
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete);

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
    };
  }, [router.events]);

  useEffect(() => {
    if (userId) {
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        mixpanel.identify(userId);
      }
    }
  }, [userId]);

  return (
    <AnalyticsContext.Provider
      value={{
        capture,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export default Analytics;
