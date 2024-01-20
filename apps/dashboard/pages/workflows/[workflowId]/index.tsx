import AddIcon from '@mui/icons-material/Add';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  CircularProgress,
  ListItemDecorator,
  Stack,
  TabList,
  Tabs,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Tab, { tabClasses } from '@mui/joy/Tab';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import JobsTable from '@app/components/JobsTable';
import Layout from '@app/components/Layout';
import WorkflowSettings from '@app/components/WorkflowSettings';
import useStateReducer from '@app/hooks/useStateReducer';
import { getWorkflow } from '@app/pages/api/workflows/[id]';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { Prisma } from '@chaindesk/prisma';

export default function JobsPage() {
  const router = useRouter();

  const [state, setState] = useStateReducer({
    isCreateJobModalOpen: false,
  });

  const singalRevalidationRef = React.useRef(0);

  const getWorkflowQuery = useSWR<Prisma.PromiseReturnType<typeof getWorkflow>>(
    `/api/workflows/${router.query?.workflowId}`,
    fetcher
  );

  const deleteJobsMutation = useSWRMutation(
    `/api/jobs/delete`,
    generateActionFetcher(HTTP_METHOD.POST)
  );

  // used to force sync data
  const signalRevalidation = () => singalRevalidationRef.current++;

  const handleBulkDelete = async (ids: string[]) => {
    await deleteJobsMutation.trigger({ ids });
    signalRevalidation();
  };

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };
  React.useEffect(() => {
    if (router.isReady && typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('jobs');
    }
  }, [router.isReady, router.query.tab]);

  if (!getWorkflowQuery?.data) {
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
        width: '100%',
      })}
    >
      <>
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
          <Link href={RouteNames.WORKFLOWS}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              Workflows
            </Typography>
          </Link>
          <Typography
            fontSize="inherit"
            color="neutral"
            className="hover:underline"
          >
            {getWorkflowQuery?.data?.name}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: 1,
            mb: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              my: 1,
              gap: 1,
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            <Typography level="h1" fontSize="xl4">
              {getWorkflowQuery?.data?.name}
            </Typography>

            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={2}
              sx={{
                width: '100%',
              }}
            >
              <Tabs
                aria-label="Tabs"
                value={(router.query.tab as string) || 'Jobs'}
                size="md"
                sx={{
                  background: 'transparent',
                  width: '100%',
                }}
                onChange={(event, value) => {
                  handleChangeTab(value as string);
                }}
              >
                <TabList
                  size="sm"
                  sx={{
                    justifyContent: 'start',
                    [`&& .${tabClasses.root}`]: {
                      flex: 'initial',
                      bgcolor: 'transparent',
                      '&:hover': {
                        bgcolor: 'transparent',
                      },
                      [`&.${tabClasses.selected}`]: {
                        color: 'primary.plainColor',
                        '&::after': {
                          height: '3px',
                          borderTopLeftRadius: '3px',
                          borderTopRightRadius: '3px',
                          bgcolor: 'primary.500',
                        },
                      },
                    },
                  }}
                >
                  <Tab indicatorInset value={'jobs'}>
                    <ListItemDecorator>
                      <AutoGraphRoundedIcon />
                    </ListItemDecorator>
                    Jobs
                  </Tab>
                  <Tab indicatorInset value={'settings'}>
                    <ListItemDecorator>
                      <SettingsIcon />
                    </ListItemDecorator>
                    Settings
                  </Tab>
                </TabList>
              </Tabs>
            </Stack>
          </Box>
        </Box>

        {router.query.tab === 'jobs' && (
          <JobsTable
            handleBulkDelete={handleBulkDelete}
            isDeleting={deleteJobsMutation.isMutating}
            revalidationRef={singalRevalidationRef.current}
          />
        )}

        {router.query.tab === 'settings' && (
          <Box
            sx={{
              height: '100%',
              overflowY: 'scroll',
              mt: -5,
              pt: 4,
            }}
          >
            <WorkflowSettings workflowId={getWorkflowQuery.data.id} />
          </Box>
        )}
      </>
    </Box>
  );
}

JobsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
