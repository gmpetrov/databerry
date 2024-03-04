'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import YouTubeIcon from '@mui/icons-material/YouTube';
import {
  Alert,
  AspectRatio,
  Box,
  Button,
  Card,
  CardContent,
  CardOverflow,
  Chip,
  Divider,
  Stack,
  Typography,
  useColorScheme,
} from '@mui/joy';
import { LLMTaskOutputType } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
// import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

// import { Footer } from '@app/components/landing-page/Footer';
// import PoweredByCard from '@app/components/PoweredByCard';
// import SEO from '@app/components/SEO';
// import TopBar from '@app/components/TopBar';
import slugify from '@chaindesk/lib/slugify';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { SummaryPageProps } from '@chaindesk/lib/types';
import { YoutubeSummarySchema } from '@chaindesk/lib/types/dtos';
import { YOUTUBE_VIDEO_URL_RE } from '@chaindesk/lib/youtube-api/lib';
import { Prisma } from '@chaindesk/prisma';
import prisma from '@chaindesk/prisma/client';
import Input from '@chaindesk/ui/Input';

import PromoAlert from '../promo-alert';

type Props = {};

type FormType = z.infer<typeof YoutubeSummarySchema>;

function YoutubeSummarizerForm({}: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { control, register, handleSubmit, formState } = useForm<FormType>({
    mode: 'onChange',
    resolver: zodResolver(YoutubeSummarySchema),
  });

  // const getLatestVideosQuery = useSWR<
  //   Prisma.PromiseReturnType<typeof getLatestVideos>
  // >(`${apiUrl}/api/tools/youtube-summary`, fetcher);

  const summaryMutation = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tools/youtube-summary`,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const onSubmit = async (payload: any) => {
    try {
      const response = await summaryMutation.trigger({
        ...payload,
      });
      const videoId = payload.url.match(YOUTUBE_VIDEO_URL_RE)?.[1];
      const videoUrl = `${process.env.NEXT_PUBLIC_LANDING_PAGE_URL}/tools/youtube-summarizer/${videoId}`;
      if (response?.externalId) {
        router.push(videoUrl);
      } else {
        setIsProcessing(true);
        await new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tools/youtube-summary/${videoId}`
              );
              if (res.data) {
                router.push(videoUrl);
                resolve(true);
                clearInterval(interval);
              }
            } catch (err) {
              console.log(err);
              reject(err);
            }
          }, 1000 * 10);
        });
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        const msg = err?.response?.data;
        if (msg) {
          let text = msg;
          if (msg?.includes?.('RATE_LIMIT')) {
            text = 'Rate limit exceeded! Please try again in few minutes.';
          }
          return toast.error(JSON.stringify(text));
        }
      }
      toast.error('An error occurred. Please try again in few minutes.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = summaryMutation.isMutating || isProcessing;

  return (
    <>
      {/* <SEO
        title="Free AI Youtube Video Summarizer"
        description="Generate YouTube video summaries instantly for free with AI"
        uri={router.asPath}
        ogImage={`https://www.chaindesk.ai/api/og/youtube-summary`}
      /> */}

      <PromoAlert />

      <motion.div
        className="w-full h-full"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
          },
        }}
        initial="hidden"
        animate="visible"
      >
        {/* <TopBar href="https://www.chaindesk.ai/?utm_source=landing_page&utm_medium=tool&utm_campaign=youtube_summarizer" /> */}

        <Stack
          sx={{
            flex: 1,
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            p: 2,
            alignItems: 'center',
          }}
        >
          <Stack sx={{ width: 'md', maxWidth: '100%' }} spacing={4}>
            <Stack spacing={1}>
              <span
                // level="h2"
                className="text-3xl font-bold text-center text-pink-400 font-caveat"
              >
                Free
              </span>
              <h1
                // sx={{ textAlign: 'center', fontWeight: 'bold' }}
                // level="h1"
                // color="primary"
                className="pb-4 text-5xl font-extrabold text-center text-transparent font-bricolage-grotesque md:text-7xl text-zinc-800"
              >
                AI YouTube Summarizer
              </h1>
            </Stack>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-wrap items-center space-y-2 min-w-full md:flex md:space-y-0 md:space-x-2"
            >
              <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                <Stack sx={{ width: '100%' }} spacing={1}>
                  <Input
                    control={control}
                    // className="flex-1 w-full"
                    {...register('url')}
                    // Otherwise got error when submiting with return key 🤷
                    onBlur={(e) => {}}
                    placeholder="Paste your youtube video link here"
                    disabled={isLoading}
                    startDecorator={<YouTubeIcon />}
                    size="lg"
                    sx={{ borderRadius: '20px' }}
                    endDecorator={
                      formState.isValid && (
                        <Button
                          type="submit"
                          variant="solid"
                          color="primary"
                          disabled={!formState.isValid}
                          loading={isLoading}
                          size="lg"
                          sx={{ borderRadius: '20px' }}
                          endDecorator={<EastRoundedIcon />}
                        >
                          Summarize
                        </Button>
                      )
                    }
                  />
                  <a
                    href="https://www.chaindesk.ai/?utm_source=landing_page&utm_medium=tool&utm_campaign=youtube_summarizer"
                    target="_blank"
                    style={{
                      textDecoration: 'none',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginBottom: '2px',
                    }}
                  >
                    <Chip variant="outlined" size="sm" color="neutral">
                      <Box className="truncate" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography level="body-xs" fontSize={'10px'}>
                          Powered by{' '}
                          <Typography color="primary" fontWeight={'bold'}>
                            ⚡️ Chaindesk
                          </Typography>
                        </Typography>
                      </Box>
                    </Chip>
                  </a>
                </Stack>
                {isLoading && (
                  <Alert sx={{ mx: 'auto' }} color="warning">
                    Please do not close the window while we process the video.
                    It can take 1-2mins.
                  </Alert>
                )}
              </Stack>
            </form>
          </Stack>

          {/* {(summaries?.length || 0) > 0 && (
            <Stack sx={{ mt: 10, width: '100%' }} spacing={2}>
              <Typography level="body-lg" sx={{ textAlign: 'center' }}>
                Latest Video Summaries
              </Typography>
              <Stack
                flexWrap="wrap"
                useFlexGap
                sx={(theme) => ({
                  maxWidth: '100%',
                  width: 'lg',
                  justifyContent: 'center',
                  gap: 2,

                  [theme.breakpoints.up('sm')]: {
                    flexDirection: 'row',
                  },
                })}
              >
                {getLatestVideosQuery?.data?.map((each) => (
                  <Box
                    key={each.id}
                    sx={(theme) => ({
                      width: '100%',
                      [theme.breakpoints.up('sm')]: {
                        maxWidth: '350px',
                        width: '30%',
                      },
                    })}
                  >
                    <Link
                      href={`/tools/youtube-summarizer/${slugify(
                        (each as SummaryPageProps)?.output?.metadata?.title
                      )}-${each.externalId}`}
                      className="w-full"
                    >
                      <Card sx={{ width: '100%' }}>
                        <CardOverflow>
                          <AspectRatio ratio="2">
                            <img
                              src={
                                (each as SummaryPageProps)?.output?.metadata
                                  ?.thumbnails?.high?.url
                              }
                              alt=""
                            />
                          </AspectRatio>
                        </CardOverflow>
                        <CardContent>
                          <Typography level="h4" noWrap>
                            {
                              (each as SummaryPageProps)?.output?.metadata
                                ?.title
                            }
                          </Typography>
                          <Typography level="body-md" noWrap>
                            {
                              (each as SummaryPageProps)?.output?.metadata
                                ?.description
                            }
                          </Typography>
                        </CardContent>
                      </Card>
                    </Link>
                  </Box>
                ))}
              </Stack>

              <Stack sx={{ justifyContent: 'center' }}>
                <Link
                  href="/tools/youtube-summarizer/all/0"
                  style={{ marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <Button
                    endDecorator={<ArrowForwardRoundedIcon />}
                    variant="outlined"
                  >
                    🎬 More Video Summaries
                  </Button>
                </Link>
              </Stack>
            </Stack>
          )} */}
          {/* 
          <PoweredByCard
            sx={{
              mt: 10,
              py: 8,
              width: '100%',
              maxWidth: 'md',
              mb: 20,
            }}
          /> */}
        </Stack>
      </motion.div>
    </>
  );
}

export default YoutubeSummarizerForm;
