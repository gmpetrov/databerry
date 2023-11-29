import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  useColorScheme,
} from '@mui/joy';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import superjson from 'superjson';

import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';
import useStateReducer from '@app/hooks/useStateReducer';

import { Schema } from '@chaindesk/lib/openai-tools/youtube-summary';
import prisma from '@chaindesk/prisma/client';

interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

interface Metadata {
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

interface SummaryPageProps {
  output: Schema & {
    metadata: Metadata;
  };
}

export default function SummaryPage({ output }: SummaryPageProps) {
  const { mode, systemMode } = useColorScheme();
  const router = useRouter();
  const videoId = router.query.id as string;
  const isDark = mode === 'dark' || (!mode && systemMode === 'dark');
  const [state, setState] = useStateReducer({
    isBannerOpen: false,
    currentChapter: 0,
  });
  return (
    <>
      <TopBar />
      <SEO
        title="Youtube Tool By Chaindesk."
        description="Generate youtube video summary instantly for free."
        uri={router.asPath}
        ogImage={`/api/og/youtube-summary?state=${encodeURIComponent(
          JSON.stringify({
            title: output?.metadata?.title,
            // TODO: Do we really want another call in the youtubeApi Class for this ?
            channelThumbnail: output?.metadata?.thumbnails?.high?.url,
            videoThumbnail: output?.metadata?.thumbnails?.default?.url,
          })
        )}`}
      />

      <Stack
        direction="column"
        spacing={4}
        className="container mx-auto max-w-6xl relative px-2 py-4 sm:px-8 scroll-smooth"
      >
        <img
          src={output?.metadata?.thumbnails?.high?.url}
          className={`max-w-full max-h-64`}
        />
        <Box>
          <Typography level="body-sm">
            Published{' '}
            {dayjs(output?.metadata?.publishedAt).format('MMMM D YYYY')} on
            Youtube
          </Typography>
          <Typography level="h3">{output?.metadata?.title}</Typography>

          <Box mt={1}>
            {output.thematics.map((tag, i) => (
              <Chip key={i} size="sm" color="neutral" className="mx-1">
                {tag}
              </Chip>
            ))}
          </Box>
        </Box>
        <Stack direction="row" className="sm:space-x-12">
          <Box className=" hidden sm:block">
            <Box className="sticky top-10 pt-10  space-y-2">
              <Typography level="title-md">Chapters</Typography>
              <ol className="list-decimal ml-5 space-y-2">
                {output.chapters.map(({ title }, index) => (
                  <li key={index}>
                    <a href={`#${title}`}>{title}</a>
                  </li>
                ))}
              </ol>
            </Box>
          </Box>
          <Box className="w-full relative pt-10">
            {output.chapters.map(({ title, summary }, index) => (
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
                    className="prose text-black dark:text-white min-w-full"
                    remarkPlugins={[remarkGfm]}
                  >
                    {summary}
                  </ReactMarkdown>
                </Box>
              </Stack>
            ))}
          </Box>
        </Stack>
        <Divider />
        <Stack spacing={2} mt={2}>
          <Typography level="title-md">Overall Summary</Typography>
          <ReactMarkdown
            className="prose text-black dark:text-white min-w-full"
            remarkPlugins={[remarkGfm]}
          >
            {output.videoSummary}
          </ReactMarkdown>
        </Stack>
      </Stack>

      {state.isBannerOpen && (
        <Stack
          sx={[
            {
              // Overlay the header.
              zIndex: 1101,
            },
          ]}
          className=" sticky flex justify-center pt-32 md:pt-0 inset-0 md:bottom-0  w-full h-screen md:h-[250px] bg-gray-900"
        >
          <Box className="absolute top-1 right-1">
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
            justifyContent="sm:flex-end"
            spacing={4}
            className="w-full h-full container mx-auto max-w-5xl md:flex-row space-x-3"
          >
            <Box>
              {/* Turn timecode to seconds */}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&start=${output.chapters[
                  state.currentChapter
                ].startTimecode
                  .split(':')
                  .reduce((acc, val) => acc * 60 + parseInt(val), 0)}`}
                allowFullScreen
                title={output.chapters[state.currentChapter].title}
                className="min-h-[400px] sm:min-h-[200px] sm:h-full w-full  md:w-[500px] md:p-2 md:rounded-xl"
              />
            </Box>
            <Box className="flex flex-col justify-center w-full text-white space-y-3">
              <Typography level="h3" className="text-white">
                {output.chapters[state.currentChapter].title}
              </Typography>
              <ReactMarkdown
                className="min-w-full text-white"
                remarkPlugins={[remarkGfm]}
              >
                {output.chapters[state.currentChapter].summary}
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
      output:
        superjson.serialize({
          ...(llmTaskOutput.output as any)?.['en'],
          metadata: {
            ...(llmTaskOutput.output as any)?.metadata,
          },
        }).json || null,
    },
    revalidate: 10,
  };
}
