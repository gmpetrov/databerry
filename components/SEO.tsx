import Head from 'next/head';
import React from 'react';

type Props = {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
};

function SEO(props: Props) {
  return (
    <Head>
      <title>{props.title}</title>

      <meta name="title" content={props.title} />
      <meta name="description" content={props.description} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />

      <meta
        name="keywords"
        content={`"AI chatbot, No-code platform, Customer support, Onboarding, Slack AI chatbot, Automation, Chaindesk, ChatGPT Plugin" ${
          props.keywords || ''
        }`}
      />

      <meta property="og:image" content="/og-image.png" />
      <meta property="twitter:image" content="/og-image.png" />
      <meta property="twitter:card" content="summary_large_image" />
    </Head>
  );
}

export default SEO;
