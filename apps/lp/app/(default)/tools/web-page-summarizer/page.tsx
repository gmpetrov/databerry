import { Metadata } from 'next';
import { cache } from 'react';
import React from 'react';

import { SummaryPageProps } from '@chaindesk/lib/types';

import Cta from '@/components/cta';
import HeroProduct from '@/components/hero-product';
import PromoAlert from '@/components/promo-alert';
import LatestVideoSummaries from '@/components/youtube-summarizer/latest-summaries';
// import YoutubeSummarizerForm from '@/components/youtube-summarizer/summarize-form';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_PAGE_URL!),
  title: 'AI News',
  description: 'Get the latest AI news before anyone else.',
  alternates: {
    canonical: '/ai-news',
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
    `${process.env.NEXT_PUBLIC_API_URL}/api/tools/web-page-summary`
  );
  return res.json();
});

export default async function WebPageSummarizer() {
  const summaries = await getLatestSummaries();

  return (
    <>
      <HeroProduct
        name="Stay ahead of the curve"
        title="AI News"
        description="Get the latest AI news before anyone else."
      />
      <div className="relative">
        <div className="-mt-24 mb-24">
          {/* <YoutubeSummarizerForm /> */}

          <div className="px-4">
            <LatestVideoSummaries
              summaries={summaries || []}
              baseUrl={'/ai-news'}
              label="Latest News"
            />
          </div>
        </div>
        <Cta />
      </div>
    </>
  );
}
