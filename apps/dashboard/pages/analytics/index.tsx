import { CloseRounded } from '@mui/icons-material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventIcon from '@mui/icons-material/Event';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoIcon from '@mui/icons-material/Info';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import {
  Alert,
  Box,
  Breadcrumbs,
  Card,
  IconButton,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next/types';
import React, { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import AnalyticsCard from '@app/components/AnalyticsCard';
import AreaChart from '@app/components/charts/AreaChart';
import GeoChart from '@app/components/charts/GeoChart';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Agent, Prisma } from '@chaindesk/prisma';

import { getAgents } from '../api/agents';

const ANALYTICS_API_URL = '/api/analytics';

interface ReplieMetricBase {
  year: number;
  good_count: number;
  bad_count: number;
}

interface ConversationMetricBase {
  year: number;
  conversation_count: number;
}

const getMonthName = (num: number) =>
  [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][num - 1];

export default function AnalyticsPage() {
  const [state, setState] = useStateReducer({
    conversation_count: 0,
    bad_message_count: 0,
    good_message_count: 0,
    lead_count: 0,
    most_common_datasource: 'None',
    repliesEvolution: [],
    visitsPerCountry: [],
    conversationEvolution: [],
    view: 'year',
    agentId: '',
  });
  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(
        `${ANALYTICS_API_URL}?view=${state.view}&agent_id=${state.agentId}`
      );
      setState(response.data);
    } catch (e) {
      toast.error('Unable to fetch your analytics');
      console.error(e);
    }
  }, [state.view, state.agentId]);

  useEffect(() => {
    fetchAnalytics();
  }, [state.view, state.agentId]);

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
        width: '100%',
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
          Analytics
        </Typography>
      </Breadcrumbs>

      <Alert startDecorator={<InfoIcon />} color="primary" variant="soft">
        This view is refreshed every hour
      </Alert>

      <Stack display="flex" direction="row" spacing={2} mt={1}>
        <Box
          display="flex"
          flexDirection="column"
          flexShrink="initial"
          sx={{ mt: 2 }}
        >
          <Typography level="body-xs">Date Range</Typography>
          <Select
            defaultValue="year"
            startDecorator={<EventIcon fontSize="lg" />}
            sx={{ width: 155, height: 30 }}
            onChange={(_, value) => {
              if (value) {
                setState({ view: value });
              }
            }}
          >
            <Option value="year">All Time</Option>
            <Option value="month">This Month</Option>
          </Select>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flexShrink="initial"
          sx={{ mt: 2 }}
        >
          <Typography level="body-xs">Agent</Typography>
          <Select
            value={state.agentId}
            placeholder="Filter by Agent"
            startDecorator={<SupportAgentIcon fontSize="lg" />}
            sx={{ width: 235, height: 30 }}
            onChange={(_, value) => {
              if (value) {
                setState({ agentId: value });
              }
            }}
            {...(state.agentId && {
              endDecorator: (
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={() => {
                    setState({ agentId: '' });
                  }}
                >
                  <CloseRounded />
                </IconButton>
              ),
              indicator: null,
            })}
          >
            {getAgentsQuery.data?.map(({ id, name }) => (
              <Option value={id} key={id}>
                {name}
              </Option>
            ))}
          </Select>
        </Box>
      </Stack>

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="flex-start"
        alignItems="stretch"
        gap={2}
        mt={0.5}
      >
        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            label="Total Conversations"
            value={state.conversation_count}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            label="Liked Responses"
            value={state.good_message_count}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            label="Disliked Responses"
            value={state.bad_message_count}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard label="Leads Generated" value={state.lead_count} />
        </Box>
        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            label="Most Used Datasource"
            value={state.most_common_datasource}
          />
        </Box>
      </Box>
      {state.view === 'year' ? (
        <>
          <AreaChart<ReplieMetricBase & { month: string }>
            data={state.repliesEvolution}
            xkey="month"
            positive_area_key="good_count"
            negative_area_key="bad_count"
            title="Replies Quality Performance"
            XAxisFormatter={getMonthName}
          />

          <AreaChart<ConversationMetricBase & { month: string }>
            data={state.conversationEvolution}
            xkey="month"
            area_key="conversation_count"
            title="Conversations Evolution"
            XAxisFormatter={getMonthName}
          />
        </>
      ) : (
        <>
          <AreaChart<ReplieMetricBase & { day: string }>
            data={state.repliesEvolution}
            xkey="day"
            positive_area_key="good_count"
            negative_area_key="bad_count"
            title="Replies Quality Performance"
          />

          <AreaChart<ConversationMetricBase & { day: string }>
            data={state.conversationEvolution}
            xkey="day"
            area_key="conversation_count"
            title="Conversations Evolution"
          />
        </>
      )}
      <Card variant="outlined" sx={{ px: 5, py: 2, mt: 4 }}>
        <Typography textAlign="center">Conversations Per Country</Typography>
        <GeoChart
          label="visits"
          data={state.visitsPerCountry}
          totalConversation={state.conversation_count}
        />
      </Card>
    </Box>
  );
}

AnalyticsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
