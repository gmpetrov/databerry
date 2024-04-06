/* eslint-disable jsx-a11y/anchor-is-valid */
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import {
  Box,
  Button,
  Card,
  Skeleton,
  Stack,
  Table,
  Typography,
} from '@mui/joy';
import Chip from '@mui/joy/Chip';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import { ColorPaletteProp } from '@mui/joy/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { getForm } from '@app/pages/api/forms/[formId]';
import { getSubmissions } from '@app/pages/api/forms/[formId]/submissions';

import pagination from '@chaindesk/lib/pagination';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';
import ChatMessageAttachment from '@chaindesk/ui/Chatbox/ChatMessageAttachment';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

type Props = {
  formId: string;
};

function FormSubmissionsTab({ formId }: Props) {
  const router = useRouter();
  const limit = 25;
  const offset = Number(router.query.offset || 0);
  // const nbPages = 0;

  const [state, setState] = useStateReducer({
    hasMore: false,
  });

  const getFormQuery = useSWR<Prisma.PromiseReturnType<typeof getForm>>(
    formId ? `/api/forms/${formId}` : null,
    fetcher
  );

  const getSubmissionsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getSubmissions>
  >(() => {
    const params = new URLSearchParams({
      offset: `${offset}`,
      limit: `${limit}`,
    });

    return `/api/forms/${formId}/submissions?${params.toString()}}`;
  }, fetcher);

  const total = getSubmissionsQuery?.data?.total || 0;
  const submissions = getSubmissionsQuery?.data?.submissions || [];
  const nbPages = Math.ceil(total / limit) || 1;

  const offsetIndexes =
    React.useMemo(() => {
      return pagination(offset, nbPages).map((each) => `${each}`);
    }, [offset, nbPages]) || [];

  const cols = useMemo(() => {
    const uniques = new Set();

    (submissions || []).forEach((each) => {
      Object.keys(each.data as any).forEach((key) => {
        uniques.add(key.toLowerCase());
      });
    });

    return [...Array.from(uniques), 'createdAt'];
  }, [submissions?.length]);

  React.useEffect(() => {
    router.query.limit = `${limit}`;
    router.query.offset = `${offset}`;
    router.replace(router, undefined, { shallow: true });
  }, []);

  const loading = getFormQuery?.isLoading || !getSubmissionsQuery?.data;

  return (
    <Skeleton
      loading={loading}
      variant="rectangular"
      sx={{ maxHeight: '100%', width: '100%' }}
    >
      <Stack sx={{ height: '100%' }} gap={1}>
        {total > 0 && (
          <Card size="sm">
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography>
                Total: <strong>{total}</strong>
              </Typography>

              <Button disabled size="sm">
                Export
              </Button>
            </Stack>
          </Card>
        )}

        {submissions?.length <= 0 && (
          <Card>
            <Stack
              sx={{ width: '100%', height: '100%', py: 12 }}
              alignItems="center"
              justifyContent="center"
              gap={2}
            >
              <InboxRoundedIcon fontSize={'xl3'} />

              <Typography level="h3">No submissions</Typography>
            </Stack>
          </Card>
        )}
        {(submissions?.length || 0) > 0 && (
          <Card size="sm">
            <Table
              aria-label="Form Submissions Table"
              sx={{ maxHeight: '100%', overflowY: 'auto' }}
            >
              <thead>
                <tr>
                  {(cols || []).map((each: any) => (
                    <th key={each}>{each}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions?.map((each) => (
                  <tr key={each.id}>
                    {(cols || []).map((col: any) => {
                      let val = '';
                      let documents: string[] = [];
                      if (col === 'createdAt') {
                        val = each?.createdAt?.toString();
                      } else {
                        val = (each?.data as any)?.[col] as string;
                        try {
                          documents = JSON.parse(val);
                        } catch {}
                      }

                      return (
                        <td key={col}>
                          <div
                            className={`relative flex items-center space-x-2 overflow-x-auto ${
                              documents.length > 0 ? 'min-h-[200px]' : ''
                            }`}
                          >
                            {documents.length > 1 && (
                              <Chip
                                className="absolute top-0 right-0"
                                size="sm"
                              >
                                {documents.length - 1} more {'->'}
                              </Chip>
                            )}

                            {documents.length > 0
                              ? documents.map((doc, i) => {
                                  const isVideo = /\.(mp4|mov|avi|mkv)$/i.test(
                                    doc
                                  );
                                  const isImage = /\.(png|jpg|jpeg|gif)$/i.test(
                                    doc
                                  );
                                  const isAudio = /\.(mp3|wav|ogg)$/i.test(doc);
                                  if (isImage) {
                                    return (
                                      <ChatMessageAttachment
                                        key={i}
                                        attachment={{
                                          name: '',
                                          mimeType: 'image/',
                                          url: doc,
                                          size: 1,
                                        }}
                                      />
                                    );
                                  } else if (isAudio) {
                                    return (
                                      <ChatMessageAttachment
                                        key={i}
                                        attachment={{
                                          name: '',
                                          mimeType: 'audio/',
                                          url: doc,
                                          size: 1,
                                        }}
                                      />
                                    );
                                  } else if (isVideo) {
                                    return (
                                      <ChatMessageAttachment
                                        key={i}
                                        attachment={{
                                          name: '',
                                          mimeType: 'video/',
                                          url: doc,
                                          size: 1,
                                        }}
                                      />
                                    );
                                  } else {
                                    return (
                                      <ChatMessageAttachment
                                        key={i}
                                        attachment={{
                                          name: 'file',
                                          mimeType: '',
                                          url: doc,
                                          size: 10000,
                                        }}
                                      />
                                    );
                                  }
                                })
                              : val}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {total > 0 && (
          <>
            <Box
              className="Pagination-mobile"
              sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}
            >
              <IconButton
                aria-label="previous page"
                variant="outlined"
                color="neutral"
                size="sm"
              >
                <i data-feather="arrow-left" />
              </IconButton>
              <Typography level="body-sm" mx="auto">
                Page 1 of 10
              </Typography>
              <IconButton
                aria-label="next page"
                variant="outlined"
                color="neutral"
                size="sm"
              >
                <i data-feather="arrow-right" />
              </IconButton>
            </Box>
            <Box
              className="Pagination-laptopUp"
              sx={{
                pt: 4,
                gap: 1,
                [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
                display: {
                  xs: 'none',
                  md: 'flex',
                },
              }}
            >
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                startDecorator={<ArrowBackRoundedIcon />}
                onClick={() => {
                  if (offset - 1 >= 0) {
                    router.query.offset = `${offset - 1}`;
                    router.replace(router, undefined, { shallow: true });
                  }
                }}
              >
                Previous
              </Button>

              <Box sx={{ flex: 1 }} />
              {offsetIndexes.map((page) => (
                <IconButton
                  key={page}
                  size="sm"
                  variant={Number(page) ? 'outlined' : 'plain'}
                  color={
                    Number(page) && Number(page) - 1 === offset
                      ? 'primary'
                      : 'neutral'
                  }
                  onClick={() => {
                    const nb = Number(page);
                    if (nb) {
                      router.query.offset = `${nb - 1}`;
                      router.replace(router, undefined, { shallow: true });
                    }
                  }}
                >
                  {page}
                </IconButton>
              ))}
              <Box sx={{ flex: 1 }} />

              <Button
                size="sm"
                variant="plain"
                color="neutral"
                endDecorator={<ArrowForwardRoundedIcon />}
                onClick={() => {
                  if (offset + 1 < nbPages) {
                    router.query.offset = `${offset + 1}`;
                    router.replace(router, undefined, { shallow: true });
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Skeleton>
  );
}

export default FormSubmissionsTab;
