'use client';
import {
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

import slugify from '@chaindesk/lib/slugify';
import { SummaryPageProps } from '@chaindesk/lib/types';

type Props = {
  summaries: any[];
};

export default function LatestVideoSummaries({ summaries }: Props) {
  return (
    <>
      {(summaries.length || 0) > 0 && (
        <Stack sx={{ mt: 10, width: '100%' }} spacing={2}>
          <Typography level="h4" sx={{ textAlign: 'center' }}>
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
            {summaries?.map((each) => (
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
                        {(each as SummaryPageProps)?.output?.metadata?.title}
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
                // endDecorator={<ArrowForwardRoundedIcon />}
                variant="outlined"
              >
                🎬 View More Summaries
              </Button>
            </Link>
          </Stack>
        </Stack>
      )}
    </>
  );
}
