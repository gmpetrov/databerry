import { Metadata } from 'next';
import { cache } from 'react';
import React from 'react';

import { SummaryPageProps } from '@chaindesk/lib/types';
import Cta from '@chaindesk/ui/lp/cta';

import PromoAlert from '@/components/promo-alert';
import LatestVideoSummaries from '@/components/youtube-summarizer/latest-summaries';
import YoutubeSummarizerForm from '@/components/youtube-summarizer/summarize-form';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_PAGE_URL!),
  title: 'Free AI Youtube Video Summarizer',
  description: 'Generate YouTube video summaries instantly for free with AI',
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

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <YoutubeSummarizerForm />

          <div className="px-4">
            <LatestVideoSummaries
              summaries={summaries || []}
              baseUrl="/tools/youtube-summarizer"
            />
          </div>
        </div>
        <Cta />
      </section>
    </>
  );
}
