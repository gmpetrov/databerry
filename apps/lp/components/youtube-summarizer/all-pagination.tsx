'use client';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Alert,
  AspectRatio,
  Box,
  Button,
  Card,
  CardContent,
  CardOverflow,
  Stack,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import React from 'react';

import { youtubeSummaryTool } from '@chaindesk/lib/config';
import slugify from '@chaindesk/lib/slugify';
import { SummaryPageProps } from '@chaindesk/lib/types';
import { LLMTaskOutput, Prisma } from '@chaindesk/prisma';

import PromoAlert from '../promo-alert';

import YoutubeSummarizerForm from './summarize-form';

export default function Youtube(props: {
  index: number;
  items: LLMTaskOutput[];
  total: number;
}) {
  return (
    <>
      <div className="w-full h-full">
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
          <YoutubeSummarizerForm />
          {/* <Stack sx={{ width: 'md', maxWidth: '100%' }} spacing={4}>
            <Stack spacing={1}>
              <span className="text-3xl font-bold text-center text-pink-400 font-caveat">
                Free
              </span>
              <h1 className="pb-4 text-5xl font-extrabold text-center text-transparent font-bricolage-grotesque md:text-7xl text-zinc-800">
                AI YouTube Summarizer
              </h1>
            </Stack>
          </Stack>
           */}

          {(props.items?.length || 0) > 0 && (
            <Stack sx={{ mt: 10, width: '100%' }} spacing={2}>
              <Typography level="h4" sx={{ textAlign: 'center' }}>
                🎬 All Summaries
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
                {props.items?.map((each) => (
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

              <Stack sx={{ justifyContent: 'center' }} direction="row" gap={1}>
                {props.index > 0 && (
                  <Link
                    href={`/tools/youtube-summarizer/all/${props.index - 1}`}
                    // style={{ marginLeft: 'auto', marginRight: 'auto' }}
                  >
                    <Button
                      startDecorator={<ArrowBackRoundedIcon />}
                      variant="solid"
                    >
                      Prev
                    </Button>
                  </Link>
                )}
                {Math.ceil(props.total / youtubeSummaryTool.paginationLimit) >
                  props.index + 1 && (
                  <Link
                    href={`/tools/youtube-summarizer/all/${props.index + 1}`}
                    // style={{ marginLeft: 'auto', marginRight: 'auto' }}
                  >
                    <Button
                      endDecorator={<ArrowForwardRoundedIcon />}
                      variant="solid"
                    >
                      Next
                    </Button>
                  </Link>
                )}
              </Stack>
            </Stack>
          )}

          {/* <PoweredByCard
            sx={{
              mt: 10,
              py: 8,
              width: '100%',
              maxWidth: 'md',
              mb: 20,
            }}
          /> */}
        </Stack>
        {/* <Footer /> */}
      </div>
    </>
  );
}
