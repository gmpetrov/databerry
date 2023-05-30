import { getInitColorSchemeScript } from '@mui/joy/styles';
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import Script from 'next/script';

class CustomDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />

          <meta property="og:image" content="/og-image.png" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:image" content="/og-image.png" />

          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Public+Sans&display=swap"
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          />

          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-QTN3QP6PKB"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-QTN3QP6PKB');
        `}
          </Script>

          <Script id="hotjar" strategy="afterInteractive">
            {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3480619,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
          </Script>

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
          {getInitColorSchemeScript()}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default CustomDocument;
