import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import ChatBox from '@app/components/ChatBox';
import Layout from '@app/components/Layout';
import { getConversation } from '@app/pages/api/conversations/[conversationId]';
import { getJob } from '@app/pages/api/jobs/[id]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';
export default function JobPage() {
  const router = useRouter();
  useSession({ required: true });

  const getJobQuery = useSWR<Prisma.PromiseReturnType<typeof getJob>>(
    router.query.jobId ? `/api/jobs/${router.query.jobId}` : null,
    fetcher
  );

  const getConversationQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversation>
  >(
    getJobQuery.data?.conversationId
      ? `/api/logs/${getJobQuery.data.conversationId}`
      : null,
    fetcher
  );

  if (!getJobQuery.data) {
    return (
      <Stack sx={{ height: '100%' }}>
        <CircularProgress size="sm" sx={{ m: 'auto' }} />
      </Stack>
    );
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        gap: 1,
      })}
    >
      <Breadcrumbs
        size="sm"
        aria-label="breadcrumbs"
        separator={<ChevronRightRoundedIcon />}
        sx={{
          '--Breadcrumbs-gap': '1rem',
          '--Icon-fontSize': '16px',
          fontWeight: 'lg',
          color: 'neutral.400',
          px: 0,
        }}
      >
        <Link href={RouteNames.HOME}>
          <HomeRoundedIcon />
        </Link>
        <Typography fontSize="inherit" color="neutral">
          Workflows
        </Typography>
        <Typography fontSize="inherit" color="neutral">
          {router.query.workflowId}
        </Typography>
        <Typography fontSize="inherit" color="neutral">
          {router.query.jobId}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography level="h1" fontSize="xl4">
          {router.query.jobId}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      <ChatBox
        readOnly
        messages={
          getConversationQuery?.data?.messages?.map((each) => ({
            id: each.id,
            from: each.from,
            message: each.text,
            createdAt: each.createdAt,
            eval: each.eval,
            approvals: each.approvals || [],
          })) || []
        }
        isLoadingConversation={getConversationQuery?.isLoading}
      />
    </Box>
  );
}

JobPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
