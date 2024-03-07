'use client';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
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
} from '@mui/joy';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { SummaryPageProps } from '@chaindesk/lib/types';
import writeClipboard from '@chaindesk/lib/write-clipboard';
import prisma from '@chaindesk/prisma/client';
import useConfetti from '@chaindesk/ui/hooks/useConfetti';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import PromoAlert from '@/components/promo-alert';

var entities = {
  amp: '&',
  apos: "'",
  '#x27': "'",
  '#x2F': '/',
  '#39': "'",
  '#47': '/',
  lt: '<',
  gt: '>',
  nbsp: ' ',
  quot: '"',
};

function decodeHTMLEntities(text: string): string {
  return text.replace(/&([^;]+);/gm, function (match: any, entity: any) {
    return (entities as any)?.[entity] || match;
  });
}

type Props = {
  summary: SummaryPageProps;
};

export default function YoutubeSummary({ summary }: Props) {
  // const router = useRouter();
  // const { data: session } = useSession();
  const router = useRouter();
  const [state, setState] = useStateReducer({
    isBannerOpen: false,
    currentChapter: 0,
  });
  const triggerConfetti = useConfetti({});
  const lang = 'en';

  useEffect(() => {
    triggerConfetti();
  }, []);

  // const summaryMutation = useSWRMutation(
  //   `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/api/tools/youtube-summary?refresh=true`,
  //   generateActionFetcher(HTTP_METHOD.POST),
  //   {
  //     onSuccess: () => {
  //       window.location.reload();
  //     },
  //   }
  // );

  const output = summary?.output;
  const content = output[lang];
  const title = decodeHTMLEntities(output?.metadata?.title);
  console.log(
    'content.chapters[state.currentChapter]',
    content.chapters[state.currentChapter]
  );
  return (
    <>
      <Stack
        direction="column"
        spacing={4}
        mb={10}
        sx={{
          p: 2,
        }}
        className={clsx('container relative mx-auto max-w-6xl scroll-smooth')}
      >
        <PromoAlert />

        <Stack
          direction="row"
          sx={{ justifyContent: 'flex-start', alignItems: 'center' }}
          gap={2}
        >
          <Link href="/tools/youtube-summarizer">
            <IconButton
              variant="outlined"
              sx={{ borderRadius: '20px' }}
              // onClick={router.back}
              size="sm"
            >
              <ChevronLeftRoundedIcon />
            </IconButton>
          </Link>
          <Typography level="h1" sx={{ mr: 'auto' }}>
            {title}
          </Typography>
          <Stack direction="row" gap={1}>
            <IconButton
              variant="outlined"
              sx={{ borderRadius: '20px' }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `AI YouTube Summary: ${title}`,
                    text: output?.metadata?.title,
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
                )} */}
            </IconButton>

            {/* {session?.roles?.includes?.('SUPERADMIN') && (
                <IconButton
                  color="danger"
                  variant="outlined"
                  sx={{ borderRadius: '20px' }}
                  disabled={summaryMutation.isMutating}
                  onClick={() =>
                    summaryMutation.trigger({
                      url: `https://www.youtube.com/watch?v=${router.query.id}`,
                    })
                  }
                >
                  <RefreshIcon />
                </IconButton>
              )} */}
          </Stack>
        </Stack>
        <AspectRatio
          objectFit="cover"
          sx={{
            // height: '200px',
            overflow: 'hidden',
            borderRadius: 'xl',
          }}
        >
          {/* <img src={output?.metadata?.thumbnails?.high?.url} /> */}
          <iframe
            src={`https://www.youtube.com/embed/${summary?.externalId}?controls=1`}
            allowFullScreen
            className="w-full h-auto"
          />
        </AspectRatio>
        <Box>
          {output?.metadata?.publishedAt && (
            <Typography level="body-sm">
              Published{' '}
              {dayjs(output?.metadata?.publishedAt).format('MMMM D YYYY')} on
              Youtube
            </Typography>
          )}

          {/* <Box mt={1}>
            {content.thematics.map((tag, i) => (
              <Chip key={i} size="sm" color="neutral" className="mx-1">
                {tag}
              </Chip>
            ))}
          </Box> */}
        </Box>

        <Divider />

        {content?.videoSummary && (
          <>
            <Stack spacing={2} mt={2}>
              <Typography level="title-md" fontWeight={'bold'}>
                Summary
              </Typography>
              <ReactMarkdown
                className="min-w-full text-zinc-600 prose"
                remarkPlugins={[remarkGfm]}
              >
                {content.videoSummary}
              </ReactMarkdown>
            </Stack>

            <Divider />
          </>
        )}

        <Stack direction="row" className="sm:space-x-12">
          <Box className="hidden sm:block">
            <Box className="sticky top-10 pt-12 space-y-2">
              <Typography level="title-md" fontWeight={'bold'}>
                Chapters
              </Typography>
              <ol className="ml-5 space-y-2 list-decimal">
                {content.chapters.map(({ title }, index) => (
                  <li key={index} className="hover:underline">
                    <a href={`#${title}`}>
                      <Typography level="body-md" color="neutral">
                        {decodeHTMLEntities(title)}
                      </Typography>
                    </a>
                  </li>
                ))}
              </ol>
            </Box>
          </Box>
          <Stack className="relative items-start pt-10 w-full">
            {content.chapters.map(({ title, summary }, index) => (
              <Stack
                direction="row"
                key={index}
                justifyContent="flex-start"
                className="flex justify-start space-x-6 space-y-6 w-full"
              >
                {/* fix anchor hidden by header */}
                <div className="relative -top-16" id={title}></div>
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
                  <Typography level="title-lg">{title}</Typography>
                  <ReactMarkdown
                    className="min-w-full text-zinc-500 prose"
                    remarkPlugins={[remarkGfm]}
                  >
                    {decodeHTMLEntities(summary)}
                  </ReactMarkdown>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Stack>

        {/* <PoweredByCard
          sx={{
            mt: 10,
            py: 8,
            width: '100%',
          }}
        /> */}
      </Stack>

      {state.isBannerOpen && (
        <motion.div
          // sx={(theme) => ({
          //   // Overlay the header.
          //   zIndex: 1101,
          //   // background: theme.palette.background.tooltip,
          //   p: 2,
          //   justifyContent: 'center',
          //   alignItems: 'center',
          // })}
          style={{ zIndex: 1101 }}
          className="fixed flex justify-center inset-0 md:bottom-0 md:top-auto  w-full h-screen md:h-[250px] bg-zinc-900"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ bounce: 0, duration: 0.2 }}
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
          <div className="container flex flex-col p-4 mx-auto space-y-4 w-full max-w-5xl md:h-full md:flex-row md:space-x-4">
            <Box className="w-full">
              {/* Turn timecode to seconds */}
              <iframe
                src={`https://www.youtube.com/embed/${
                  summary?.externalId
                }?autoplay=1&mute=0&controls=1&start=${content.chapters[
                  state.currentChapter
                ].offset?.replace('s', '')}`}
                // .split(':')
                // .reduce((acc, val) => acc * 60 + parseInt(val), 0)}`}
                allowFullScreen
                title={content.chapters[state.currentChapter].title}
                className="min-h-[400px] sm:min-h-[200px] sm:h-full w-full md:w-[500px]  md:rounded-xl"
              />
            </Box>
            <Box className="flex flex-col justify-start self-center space-y-3 w-full text-red-500">
              <Typography level="h3" className="!text-zinc-100">
                {content.chapters[state.currentChapter].title}
              </Typography>
              <ReactMarkdown
                className="min-w-full text-zinc-200"
                remarkPlugins={[remarkGfm]}
              >
                {content.chapters[state.currentChapter].summary}
              </ReactMarkdown>
            </Box>
          </div>
        </motion.div>
      )}
    </>
  );
}
