import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import React from 'react';

import slugify from '@chaindesk/lib/slugify';
import { SummaryPageProps } from '@chaindesk/lib/types';
import prisma from '@chaindesk/prisma/client';

import Cta from '@/components/cta';
import YoutubeSummary from '@/components/youtube-summarizer/summary';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const getSummary = cache(async (id: string) => {
  const externalId = id.slice(-11) as string;
  const llmTaskOutput = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        externalId: externalId,
        type: 'youtube_summary',
      },
    },
  });

  return llmTaskOutput as SummaryPageProps;
});

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const summary = await getSummary(id);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const title = summary?.output?.metadata?.title;
  return {
    title: `${summary?.output?.metadata?.title} - AI YouTube Video Summary | Chaindesk`,
    description:
      summary?.output?.metadata?.description ||
      `Generate YouTube video summaries instantly for free with AI`,
    alternates: {
      canonical: `/tools/youtube-summarizer/${id}`,
    },
    openGraph: {
      images: [
        `/api/og/youtube-summary?state=${encodeURIComponent(
          JSON.stringify({
            title,
            channelThumbnail: summary?.output?.metadata?.thumbnails?.high?.url,
            videoThumbnail: summary?.output?.metadata?.thumbnails?.high?.url,
          })
        )}`,
        ...previousImages,
      ],
    },
    keywords: `${
      summary?.output?.metadata?.keywords?.join(', ') || ''
    } AI chatbot, No-code platform, AI Customer Support, Onboarding, Slack AI chatbot, Automation, Chaindesk, ChatGPT Plugin, Chat PDF, Chat with any document, Custom ChatGPT Bot, Chatbot GPT, Chatbot, ChatGPT Chatbot, WhatsApp ChatGPT Chatbot`,
  };
}

export default async function YoutubeVideoSummary({
  params,
}: {
  params: { id: string };
}) {
  const videoId = params.id?.slice(-11);
  const summary = await getSummary(videoId);

  if (!summary) {
    redirect('/tools/youtube-summarizer');
  } else if (!!summary && params.id.length === 11) {
    redirect(
      `/tools/youtube-summarizer/${slugify(
        summary.output.metadata.title
      )}-${videoId}`
    );
  }

  return (
    <>
      <section className="relative before:absolute before:inset-0 before:h-80 before:pointer-events-none before:bg-gradient-to-b before:from-zinc-100 before:-z-10">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <YoutubeSummary id={params.id} summary={summary} />
          <Cta />
        </div>
      </section>
    </>
  );
}
