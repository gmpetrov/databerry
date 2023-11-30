import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import {
  AspectRatio,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  useColorScheme,
} from '@mui/joy';
import { LLMTaskOutput } from '@prisma/client';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import superjson from 'superjson';

import PoweredByCard from '@app/components/PoweredByCard';
import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';
import useConfetti from '@app/hooks/useConfetti';
import useStateReducer from '@app/hooks/useStateReducer';

import { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import writeClipboard from '@chaindesk/lib/write-clipboard';
import prisma from '@chaindesk/prisma/client';

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Metadata {
  title: string;
  channelId: string;
  thumbnails: {
    high: Thumbnail;
    medium: Thumbnail;
    default: Thumbnail;
  };
  description: string;
  publishTime: string;
  publishedAt: string;
  channelTitle: string;
  liveBroadcastContent: string;
}

export type SummaryPageProps = LLMTaskOutput & {
  output: {
    ['en']: Schema;
  } & {
    metadata: Metadata;
  };
};

export default function SummaryPage({ output }: SummaryPageProps) {
  const { mode, setMode } = useColorScheme();
  const router = useRouter();
  const videoId = router.query.id as string;
  const [state, setState] = useStateReducer({
    isBannerOpen: false,
    currentChapter: 0,
  });
  const triggerConfetti = useConfetti({});
  const lang = 'en';

  React.useEffect(() => {
    setMode('light');
  }, []);

  useEffect(() => {
    triggerConfetti();
  }, []);

  const content = output[lang];

  return (
    <>
      <TopBar href="/tools/youtube-summarizer" />
      <SEO
        title="Free AI Youtube Video Summarizer | Chaindesk.ai"
        description="Generate YouTube video summaries instantly for free with AI"
        uri={router.asPath}
        ogImage={`https://www.chaindesk.ai/api/og/youtube-summary?state=${encodeURIComponent(
          JSON.stringify({
            title: output?.metadata?.title,
            // TODO: Do we really want another call in the youtubeApi Class for this ?
            channelThumbnail: output?.metadata?.thumbnails?.high?.url,
            videoThumbnail: output?.metadata?.thumbnails?.high?.url,
          })
        )}`}
      />

      <Stack
        direction="column"
        spacing={4}
        mb={10}
        sx={{
          p: 2,
        }}
        className={clsx('container relative max-w-6xl  mx-auto scroll-smooth', {
          dark: mode === 'dark',
          light: mode === 'light',
        })}
      >
        <AspectRatio
          objectFit="cover"
          sx={{
            // height: '200px',
            overflow: 'hidden',
            borderRadius: 'xl',
          }}
        >
          <img src={output?.metadata?.thumbnails?.high?.url} />
        </AspectRatio>
        <Box>
          <Typography level="body-sm">
            Published{' '}
            {dayjs(output?.metadata?.publishedAt).format('MMMM D YYYY')} on
            Youtube
          </Typography>

          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'start' }}
            gap={1}
          >
            <Typography level="h3">{output?.metadata?.title}</Typography>
            <IconButton
              variant="outlined"
              sx={{ borderRadius: '20px' }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `AI YouTube Summary: ${output?.metadata?.title}`,
                    text: output?.metadata?.description,
                    url: window.location.href,
                  });
                } else if (navigator.clipboard) {
                  writeClipboard({
                    content: window.location.href,
                  });
                }
              }}
            >
              <ContentCopyRoundedIcon />
              {/* {!!navigator?.share ? (
                <IosShareRoundedIcon />
              ) : (
                <ContentCopyRoundedIcon />
              )} */}
            </IconButton>
          </Stack>

          <Box mt={1}>
            {content.thematics.map((tag, i) => (
              <Chip key={i} size="sm" color="neutral" className="mx-1">
                {tag}
              </Chip>
            ))}
          </Box>
        </Box>

        <Divider />

        <Stack spacing={2} mt={2}>
          <Typography level="title-md" fontWeight={'bold'}>
            Video Summary
          </Typography>
          <ReactMarkdown
            className="min-w-full prose text-gray-600 dark:text-white"
            remarkPlugins={[remarkGfm]}
          >
            {content.videoSummary}
          </ReactMarkdown>
        </Stack>

        <Divider />

        <Stack direction="row" className="sm:space-x-12">
          <Box className="hidden sm:block">
            <Box className="sticky pt-12 space-y-2 top-10">
              <Typography level="title-md" fontWeight={'bold'}>
                Chapters
              </Typography>
              <ol className="ml-5 space-y-2 list-decimal ">
                {content.chapters.map(({ title }, index) => (
                  <li key={index} className="hover:underline">
                    <a href={`#${title}`}>
                      <Typography level="body-md" color="neutral">
                        {title}
                      </Typography>
                    </a>
                  </li>
                ))}
              </ol>
            </Box>
          </Box>
          <Box className="relative w-full pt-10">
            {content.chapters.map(({ title, summary }, index) => (
              <Stack
                direction="row"
                key={index}
                id={title}
                justifyContent="flex-end"
                className="flex w-full space-x-6 space-y-6"
              >
                <Box className="mt-5">
                  <IconButton
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      setState({ currentChapter: index, isBannerOpen: true });
                    }}
                  >
                    <PlayCircleIcon />
                  </IconButton>
                </Box>

                <Box className="spac-y-4">
                  <Typography level="title-lg"> {title}</Typography>
                  <ReactMarkdown
                    className="min-w-full prose text-gray-600 dark:text-white"
                    remarkPlugins={[remarkGfm]}
                  >
                    {summary}
                  </ReactMarkdown>
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>

        <PoweredByCard
          sx={{
            mt: 10,
            py: 8,
            width: '100%',
          }}
        />
      </Stack>

      {state.isBannerOpen && (
        <Stack
          sx={(theme) => ({
            // Overlay the header.
            zIndex: 1101,
            background: theme.palette.background.tooltip,
            p: 2,
            justifyContent: 'center',
            alignItems: 'center',
          })}
          className="fixed flex justify-center  inset-0 md:bottom-0 md:top-auto  w-full h-screen md:h-[250px] "
        >
          <Box className="absolute top-4 right-4">
            <IconButton
              size="md"
              variant="soft"
              className="rounded-full"
              onClick={() => {
                setState({ isBannerOpen: false });
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Stack
            gap={3}
            className="container w-full max-w-5xl mx-auto md:h-full md:flex-row"
          >
            <Box>
              {/* Turn timecode to seconds */}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&start=${content.chapters[
                  state.currentChapter
                ].offset?.replace('s', '')}`}
                // .split(':')
                // .reduce((acc, val) => acc * 60 + parseInt(val), 0)}`}
                allowFullScreen
                title={content.chapters[state.currentChapter].title}
                className="min-h-[400px] sm:min-h-[200px] sm:h-full w-full md:w-[500px]  md:rounded-xl"
              />
            </Box>
            <Box className="flex flex-col self-center justify-start w-full space-y-3 text-white">
              <Typography level="h3" className="text-white">
                {content.chapters[state.currentChapter].title}
              </Typography>
              <ReactMarkdown
                className="min-w-full text-white"
                remarkPlugins={[remarkGfm]}
              >
                {content.chapters[state.currentChapter].summary}
              </ReactMarkdown>
            </Box>
          </Stack>
        </Stack>
      )}
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
      output: superjson.serialize(llmTaskOutput.output).json || null,
    },
    revalidate: 10,
  };
}
