import { zodResolver } from '@hookform/resolvers/zod';
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
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import Input from '@app/components/Input';
import PoweredByCard from '@app/components/PoweredByCard';
import SEO from '@app/components/SEO';
import TopBar from '@app/components/TopBar';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { YoutubeSummarySchema } from '@chaindesk/lib/types/dtos';
import { Prisma } from '@chaindesk/prisma';

import { getLatestVideos } from '../../api/tools/youtube-summary';

import { SummaryPageProps } from './[id]';

type FormType = z.infer<typeof YoutubeSummarySchema>;

export default function Youtube() {
  const { mode, systemMode, setMode } = useColorScheme();
  const router = useRouter();
  const { control, register, handleSubmit, formState } = useForm<FormType>({
    mode: 'onChange',
    resolver: zodResolver(YoutubeSummarySchema),
  });

  const apiUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;

  const getLatestVideosQuery = useSWR<
    Prisma.PromiseReturnType<typeof getLatestVideos>
  >(`${apiUrl}/api/tools/youtube-summary`, fetcher);

  const summaryMutation = useSWRMutation(
    `${apiUrl}/api/tools/youtube-summary`,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  const onSubmit = async (payload: FormType) => {
    try {
      await summaryMutation.trigger({
        ...payload,
      });

      const regex = /(?:\?v=|&v=|youtu\.be\/)([^&#]+)/;
      const match = payload.url.match(regex);

      router.push(
        `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/tools/youtube-summarizer/${
          match![1]
        }`
      );
    } catch (err) {
      toast.error(JSON.stringify(err));
    }
  };

  React.useEffect(() => {
    setMode('light');
  }, []);

  return (
    <>
      <SEO
        title="Free AI Youtube Video Summarizer"
        description="Generate YouTube video summaries instantly for free with AI"
        uri={router.asPath}
        ogImage={`https://www.chaindesk.ai/api/og/youtube-summary`}
      />
      <Stack sx={{ width: '100vw', height: '100vh' }}>
        <TopBar />

        <Stack
          sx={{
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            p: 2,
            alignItems: 'center',
          }}
        >
          <Stack sx={{ width: 'md', maxWidth: '100%', mt: 20 }} spacing={4}>
            <Stack spacing={1}>
              <Typography
                sx={{ textAlign: 'center', fontStyle: 'italic' }}
                level="h2"
                color="neutral"
              >
                Free
              </Typography>
              <Typography
                sx={{ textAlign: 'center', fontWeight: 'bold' }}
                level="display1"
                color="primary"
              >
                AI YouTube Summarizer
              </Typography>
            </Stack>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-wrap items-center min-w-full space-y-2 md:flex md:space-y-0 md:space-x-2"
            >
              <Stack spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
                <Stack sx={{ width: '100%' }} spacing={1}>
                  <Input
                    control={control}
                    // className="flex-1 w-full"
                    {...register('url')}
                    placeholder="Paste your youtube video link here"
                    disabled={summaryMutation.isMutating}
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
                          loading={summaryMutation.isMutating}
                          size="lg"
                          sx={{ borderRadius: '20px' }}
                          endDecorator={<EastRoundedIcon fontSize="md" />}
                        >
                          Summarize
                        </Button>
                      )
                    }
                  />
                  <a
                    href="https://chaindesk.ai"
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
                {summaryMutation.isMutating && (
                  <Alert sx={{ mx: 'auto' }} color="warning">
                    Please do not close the window while we process the video.
                    It can take 1-2mins.
                  </Alert>
                )}
              </Stack>
            </form>
          </Stack>

          {(getLatestVideosQuery?.data?.length || 0) > 0 && (
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
                      href={`/tools/youtube-summarizer/${each.externalId}`}
                      className="w-full"
                    >
                      <Card sx={{ width: '100%' }}>
                        <CardOverflow>
                          <AspectRatio ratio="2">
                            <img
                              src={
                                (each as SummaryPageProps)?.output?.metadata
                                  ?.thumbnails?.medium?.url
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
            </Stack>
          )}

          <PoweredByCard
            sx={{
              mt: 10,
              py: 8,
              width: '100%',
              maxWidth: 'md',
              mb: 20,
            }}
          />
        </Stack>
      </Stack>
    </>
  );
}
