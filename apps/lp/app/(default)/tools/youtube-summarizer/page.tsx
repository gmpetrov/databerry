import { Metadata } from 'next';
import { cache } from 'react';
import React from 'react';

import { SummaryPageProps } from '@chaindesk/lib/types';
import Cta from '@chaindesk/ui/lp/cta';

import PromoAlert from '@/components/promo-alert';
import Body from '@/components/youtube-summarizer/home-body';
import LatestVideoSummaries from '@/components/youtube-summarizer/latest-summaries';
import YoutubeSummarizerForm from '@/components/youtube-summarizer/summarize-form';

const metaTitle = 'YouTube Video Summarizer powered by AI';
const metaDescription =
  'Get a summary of any YouTube video with our free AI YouTube video summarizer powered by ChatGPT and Chaindesk. Summarize any video in seconds.';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_PAGE_URL!),
  title: 'YouTube Video Summarizer powered by AI',
  description:
    'Get a summary of any YouTube video with our free AI YouTube video summarizer powered by ChatGPT and Chaindesk. Summarize any video in seconds.',
  alternates: {
    canonical: '/tools/youtube-summarizer',
  },
  icons: {
    icon: '/images/logo.png',
  },
  keywords: [
    'YouTube Video Summarizer',
    'AI Video Summarizer',
    'Free Video Summarizer',
    'Free YouTube Video Summarizer',
    'AI YouTube Video Summarizer',
  ],
};

const getLatestSummaries = cache(async (): Promise<SummaryPageProps[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tools/youtube-summary`
  );
  return res.json();
});

export default async function YoutubeVideoSummarizer() {
  const summaries = await getLatestSummaries();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: metaTitle,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '4221',
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    headline: metaTitle,
    image: [],
    author: {},
    description: metaDescription,
    articleSection: 'Technology',
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/tools/youtube-summarizer`,
    publisher: {
      '@context': process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
      '@type': 'Organization',
      name: 'Chaindesk',
      legalName: 'Chaindesk',
      url: process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
      logo: `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/logo.png`,
      foundingDate: '2023',
      founders: [{ '@type': 'Organization', name: 'Chaindesk' }],
      address: {
        '@type': 'PostalAddress',
        streetAddress: "65 rue de l'Ourcq",
        addressLocality: 'Paris',
        addressRegion: 'FR',
        postalCode: '75019',
        addressCountry: 'FR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@chaindesk.ai',
      },
      sameAs: [process.env.NEXT_PUBLIC_LANDING_PAGE_URL],
    },
    breadcrumb: {
      '@type': 'BreadCrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_LANDING_PAGE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'YouTube Summarizer',
          item: `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/tools/youtube-summarizer`,
        },
      ],
    },
    mainEntity: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <YoutubeSummarizerForm />

          <div className="px-4">
            <LatestVideoSummaries
              summaries={summaries || []}
              baseUrl="/tools/youtube-summarizer"
            />
          </div>

          <Body />
        </div>
        <Cta />
      </section>
    </>
  );
}
