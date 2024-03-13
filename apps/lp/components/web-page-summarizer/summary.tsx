'use client';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PinterestIcon from '@mui/icons-material/Pinterest';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import RedditIcon from '@mui/icons-material/Reddit';
import XIcon from '@mui/icons-material/X';
import {
  AspectRatio,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  styled,
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

import { SummaryPageProps, WebPageSummary } from '@chaindesk/lib/types';
import writeClipboard from '@chaindesk/lib/write-clipboard';
import prisma from '@chaindesk/prisma/client';
import useConfetti from '@chaindesk/ui/hooks/useConfetti';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import LinkWithUTMFromPath from '@chaindesk/ui/LinkWithUTMFromPath';

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
  id: string;
  summary: WebPageSummary;
};

export default function YoutubeSummary({ id, summary }: Props) {
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
  const pageUrl = `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/ai-news/${id}`;

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

        <Typography level="h1" sx={{ textAlign: 'center' }}>
          {title}
        </Typography>

        <Stack>
          <Breadcrumbs aria-label="breadcrumbs">
            {[
              { label: 'Home', path: '/' },
              {
                label: 'AI News',
                path: '/ai-news',
              },
            ].map((item) => (
              <LinkWithUTMFromPath
                key={item.path}
                href={item.path}
                className="hover:underline"
              >
                <Typography color="neutral">{item.label}</Typography>
              </LinkWithUTMFromPath>
            ))}
            <Typography className="text-pink-600">{title}</Typography>
          </Breadcrumbs>

          <Stack direction="row" mb={1}>
            <a
              href={`https://www.facebook.com/sharer.php?u=${pageUrl}`}
              className="text-gray-400 share-item"
            >
              <span className="sr-only">facebook</span>
              <IconButton variant="plain">
                <FacebookIcon />
              </IconButton>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${pageUrl}`}
              className="text-gray-400 share-item"
            >
              <span className="sr-only">twitter</span>
              <IconButton variant="plain">
                <XIcon />
              </IconButton>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`}
              className="text-gray-400 share-item"
            >
              <span className="sr-only">linkedin</span>
              <IconButton variant="plain">
                <LinkedInIcon />
              </IconButton>
            </a>

            <a
              href={`https://pinterest.com/pin/create/button/?url=${pageUrl}`}
              className="text-gray-400 share-item"
            >
              <span className="sr-only">pinterest</span>
              <IconButton variant="plain">
                <PinterestIcon />
              </IconButton>
            </a>

            <a
              href={`https://reddit.com/submit?url=${pageUrl}`}
              className="text-gray-400 share-item"
            >
              <span className="sr-only">reddit</span>
              <IconButton variant="plain">
                <RedditIcon />
              </IconButton>
            </a>

            <IconButton
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
            </IconButton>
          </Stack>

          <AspectRatio
            objectFit="cover"
            sx={{
              // height: '200px',
              overflow: 'hidden',
              borderRadius: 'xl',
            }}
          >
            <img src={output?.metadata?.ogImage} />
            {/* <iframe
              src={`https://www.youtube.com/embed/${summary?.externalId}?controls=1`}
              allowFullScreen
              className="w-full h-auto"
            /> */}
          </AspectRatio>

          <Stack gap={1} sx={{ mt: 2 }}>
            {output?.metadata?.host && (
              <Typography level="body-sm" fontWeight={'bold'}>
                {output?.metadata?.host}
              </Typography>
            )}
            {summary?.createdAt && (
              <Typography level="body-sm">
                Updated on {dayjs(summary.createdAt).format('MMMM D YYYY')}
              </Typography>
            )}

            {/* <Box mt={1}>
            {content.thematics.map((tag, i) => (
              <Chip key={i} size="sm" color="neutral" className="mx-1">
                {tag}
              </Chip>
            ))}
          </Box> */}
          </Stack>
        </Stack>

        <Divider />
        {/* 
        {!!content?.summaries?.length && (
          <>
            <Stack spacing={2} mt={2}>
              <Typography level="title-md" fontWeight={'bold'}>
                Summary
              </Typography>
              {content.chatpers.map(({ title, summary }, index) => (
                <Stack key={index}>
                  <Typography>{title}</Typography>
                  <ReactMarkdown
                    className="min-w-full text-zinc-600 prose"
                    remarkPlugins={[remarkGfm]}
                  >
                    {summary}
                  </ReactMarkdown>
                </Stack>
              ))}
            </Stack>

            <Divider />
          </>
        )} */}

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
                {/* <Box className="mt-5">
                  <IconButton
                    size="sm"
                    variant="soft"
                    onClick={(e) => {
                      setState({ currentChapter: index, isBannerOpen: true });
                    }}
                  >
                    <PlayCircleIcon />
                  </IconButton>
                </Box> */}

                <Box className="spac-y-4">
                  <Typography level="title-lg" className="!font-title">
                    {title}
                  </Typography>
                  <ReactMarkdown
                    className="min-w-full text-zinc-500 prose"
                    remarkPlugins={[remarkGfm]}
                  >
                    {decodeHTMLEntities(summary)}
                  </ReactMarkdown>
                </Box>
              </Stack>
            ))}

            {!!content?.faq?.length && (
              <>
                <Divider sx={{ my: 4 }} />
                <Stack gap={1}>
                  <Typography
                    level="title-md"
                    fontWeight={'bold'}
                    className="!font-title"
                  >
                    FAQ
                  </Typography>
                  <Stack gap={2}>
                    {content.faq.map(({ q, a }, index) => (
                      <Stack key={index} spacing={0.5}>
                        <Typography level="body-md">
                          <Box
                            component="span"
                            sx={{ fontWeight: 'bold' }}
                          >{`Q: `}</Box>
                          {q}
                        </Typography>
                        <Typography level="body-md">
                          <Box
                            component="span"
                            sx={{ fontWeight: 'bold' }}
                          >{`A: `}</Box>
                          {a}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </>
            )}
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
    </>
  );
}
