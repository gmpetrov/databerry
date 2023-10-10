import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventIcon from '@mui/icons-material/Event';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { Box, Breadcrumbs, Option, Select, Typography } from '@mui/joy';
import axios from 'axios';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next/types';
import React, { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

import AnalyticsCard from '@app/components/AnalyticsCard';
import CustomLineChart from '@app/components/charts/CustomLineChart';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';

import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';

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
    conversationCount: 0,
    dislikedRepliesCount: 0,
    leadCount: 0,
    likedRepliesCount: 0,
    mostUsedDatasource: {
      name: '',
      count: 0,
    },
    repliesMetrics: [],
    conversationMetrics: [],
    view: 'year',
  });

  const fetchAnalytics = useCallback(async (value?: string) => {
    try {
      if (value === 'month') {
        setState({ view: 'month' });
        const response = await axios.get(`${ANALYTICS_API_URL}?view=month`);
        setState(response.data);
      } else {
        setState({ view: 'year' });
        const response = await axios.get(`${ANALYTICS_API_URL}?view=year`);
        setState(response.data);
      }
    } catch (e) {
      toast.error('Unable to fetch your analytics');
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

      <Box display="flex" flexDirection="column" flexShrink="initial">
        <Typography level="body-xs">Date Range</Typography>
        <Select
          defaultValue="year"
          startDecorator={<EventIcon fontSize="lg" />}
          sx={{ width: 155 }}
          onChange={(_, value) => {
            if (value) {
              fetchAnalytics(value);
            }
          }}
        >
          <Option value="year">This Year</Option>
          <Option value="month">This Month</Option>
        </Select>
      </Box>

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
            metric="Total Conversations"
            quantity={state.conversationCount}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            metric="Liked Responses"
            quantity={state.likedRepliesCount}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            metric="Disliked Responses"
            quantity={state.dislikedRepliesCount}
          />
        </Box>

        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard metric="Leads Generated" quantity={state.leadCount} />
        </Box>
        <Box flexGrow={1} flexShrink={1}>
          <AnalyticsCard
            metric="Most Used Datasource"
            quantity={state.mostUsedDatasource.count}
            metricSpecifier={state.mostUsedDatasource.name}
          />
        </Box>
      </Box>
      {state.view === 'year' ? (
        <>
          <CustomLineChart<ReplieMetricBase & { month: string }>
            title="Replies Quality Performance"
            data={state.repliesMetrics}
            xkey="month"
            XAxisFormatter={getMonthName}
          >
            <CustomLineChart.Line
              type="monotone"
              stroke="#f73a14"
              strokeWidth={2}
              dataKey="bad_count"
              name="Bad Replies"
            />
            <CustomLineChart.Line
              type="monotone"
              strokeWidth={2}
              dataKey="good_count"
              name="Good Replies"
            />
          </CustomLineChart>

          <CustomLineChart<ConversationMetricBase & { month: string }>
            title="Conversations Evolution"
            data={state.conversationMetrics}
            xkey="month"
            XAxisFormatter={getMonthName}
          >
            <CustomLineChart.Line
              type="monotone"
              strokeWidth={2}
              dataKey="conversation_count"
              name="Total Conversations"
            />
          </CustomLineChart>
        </>
      ) : (
        <>
          <CustomLineChart<ReplieMetricBase & { day: string }>
            title="Replies Quality Performance"
            data={state.repliesMetrics}
            xkey="day"
          >
            <CustomLineChart.Line
              type="monotone"
              stroke="#f73a14"
              strokeWidth={2}
              dataKey="bad_count"
              name="Bad Replies"
            />
            <CustomLineChart.Line
              type="monotone"
              strokeWidth={2}
              dataKey="good_count"
              name="Good Replies"
            />
          </CustomLineChart>
          <CustomLineChart<ConversationMetricBase & { day: string }>
            title="Conversations Evolution"
            data={state.conversationMetrics}
            xkey="day"
          >
            <CustomLineChart.Line
              type="monotone"
              strokeWidth={2}
              dataKey="conversation_count"
              name="Total Conversations"
            />
          </CustomLineChart>
        </>
      )}
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
