import { Box, Stack, Typography, useColorScheme } from '@mui/joy';
import clsx from 'clsx';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import superjson from 'superjson';

import CopyButton from '@app/components/CopyButton';
import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';

import { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import prisma from '@chaindesk/prisma/client';

interface SummaryPageProps {
  output: Schema & {
    title: string;
    description: string;
  };
}

export default function SummaryPage({ output }: SummaryPageProps) {
  const { mode, systemMode } = useColorScheme();
  const router = useRouter();
  const videoId = router.query.id as string;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  const isDark = mode === 'dark' || (!mode && systemMode === 'dark');

  return (
    <>
      <TopBar />
      <SEO
        title="Youtube Tool By Chaindesk."
        description="Generate youtube video summary instantly for free."
        uri={router.asPath}
        ogImage={`/api/og/youtube-summary?state=${encodeURIComponent(
          JSON.stringify({
            title: output?.title,
            channelThumbnail:
              'https://yt3.googleusercontent.com/ytc/APkrFKZ0Gg3l4gFtX-pFhXdhSd-GfxZ33nDq7DkmZ-XQEL8=s176-c-k-c0x00ffffff-no-rj',
            videoThumbnail: thumbnail,
          })
        )}`}
      />
      <Box
        className={clsx(
          `container p-4 mx-auto max-w-7xl ${isDark ? 'dark' : ''}`
        )}
      >
        <Stack className="w-full pt-4" spacing={3}>
          <Stack spacing={1}>
            <Typography level="h1">{output?.title}</Typography>
            <Typography level="body-lg">{output?.description}</Typography>

            <img
              src={thumbnail}
              className="w-full h-auto rounded-xl aspect-video "
            />
          </Stack>

          <ReactMarkdown
            className="min-w-full prose text-black dark:text-white"
            remarkPlugins={[remarkGfm]}
          >
            {output?.videoSummary!}
          </ReactMarkdown>
          <CopyButton text={output?.videoSummary!} />
        </Stack>
      </Box>
    </>
  );
}

export async function getStaticPaths() {
  const all: string[] = [];

  return {
    paths: all.map((path) => {
      return { params: { site: path } };
    }),
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const externalId = id as string;
  const llmTaskOutput = await prisma.lLMTaskOutput.findUnique({
    where: {
      unique_external_id: {
        externalId: externalId,
        type: 'youtube_summary',
      },
    },
  });

  if (!llmTaskOutput) {
    return {
      redirect: {
        destination: `/youtube`,
      },
    };
  }

  return {
    props: {
      output:
        superjson.serialize({
          ...(llmTaskOutput.output as any)?.['en'],
        }).json || null,
    },
    revalidate: 10,
  };
}
