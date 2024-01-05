import Head from 'next/head';
import React from 'react';

type Props = {};

function DefaultSEOTags({}: Props) {
  return (
    <Head>
      <meta
        key="og:image"
        property="og:image"
        content="https://www.chaindesk.ai/og-image.jpg"
      />
      <meta
        key="twitter:image"
        property="twitter:image"
        content="https://www.chaindesk.ai/og-image.jpg"
      />
      <meta
        key="twitter:card"
        property="twitter:card"
        content="summary_large_image"
      />
    </Head>
  );
}

export default DefaultSEOTags;
