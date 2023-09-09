import Head from 'next/head';
import React from 'react';

type Props = {
  title: string;
  description: string;
  image?: string;
  keywords?: string;
  faviconUrl?: string;
  url?: string;
};

function SEO(props: Props) {
  return (
    <Head>
      <title>{props.title}</title>

      <link rel="icon" href={props.faviconUrl || '/favicon.png'} sizes="any" />

      <meta name="title" content={props.title} />
      <meta name="description" content={props.description} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />

      <meta
        name="keywords"
        content={`"AI chatbot, No-code platform, Customer support, Onboarding, Slack AI chatbot, Automation, ChatbotGPT, ChatGPT Plugin, Chat PDF, Chat with any document, Custom ChatGPT Bot, Chatbot GPT, Chatbot, ChatGPT Chatbot" ${props.keywords ||
          ''}`}
      />

      <meta property="og:image" content="/og-image.png" />
      <meta property="twitter:image" content="/og-image.png" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="og:type" content="website" />

      {props.url && (
        <>
          <link rel="canonical" href={props.url} />
          <meta property="og:url" content={props.url} />
        </>
      )}
    </Head>
  );
}

export default SEO;
