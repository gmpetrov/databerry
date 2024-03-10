import { getInitColorSchemeScript } from '@mui/joy/styles';
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import Script from 'next/script';

import { themeKeys } from '@app/utils/themes/dashboard';

class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <Head>
          <meta
            key="viewport"
            name="viewport"
            content="initial-scale=1, width=device-width"
          />

          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Public+Sans&display=swap"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          ></link>

          {/* <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,500;12..96,600;12..96,700;12..96,800&display=swap"
            rel="stylesheet"
          /> */}

          {process.env.NEXT_PUBLIC_GA_ID && (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
          )}

          {process.env.NEXT_PUBLIC_GA_ID && (
            <Script id="google-analytics" strategy="afterInteractive">
              {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
            </Script>
          )}

          {process.env.NEXT_PUBLIC_HOTJAR_ID && (
            <Script id="hotjar" strategy="afterInteractive">
              {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
            </Script>
          )}

          {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
            <Script id="facebook-pixel" strategy="afterInteractive">
              {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', ${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID});
                  fbq('track', 'PageView');
                `}
            </Script>
          )}

          <script
            async
            src="https://r.wdfl.co/rw.js"
            data-rewardful="cb12e7"
          ></script>
          <Script id="rewardfull" strategy="afterInteractive">
            {`(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`}
          </Script>
        </Head>
        <body>
          {getInitColorSchemeScript({
            colorSchemeStorageKey: themeKeys.colorSchemeStorageKey,
            attribute: themeKeys.attribute,
            modeStorageKey: themeKeys.modeStorageKey,
          })}
          <script
            id="bind-joy-and-tailwindcss"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const mode = document.documentElement.getAttribute(
                      '${themeKeys.attribute}'
                    );
    
                    if (mode) {
                      document.body.classList.add(mode);
                    }
    
                  }catch {}
                })()
              `,
            }}
          ></script>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
