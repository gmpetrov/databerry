import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MessageRoundedIcon from '@mui/icons-material/MessageRounded';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  ColorPaletteProp,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/joy';
import { DatastoreVisibility, Prisma, ToolType } from '@prisma/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import AgentForm from '@app/components/AgentForm';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { getAgent } from '@app/pages/api/agents/[id]';
import { BulkDeleteDatasourcesSchema } from '@app/pages/api/datasources/bulk-delete';
import { RouteNames } from '@app/types';
import agentToolFormat from '@app/utils/agent-tool-format';
import getRootDomain from '@app/utils/get-root-domain';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const CreateDatasourceModal = dynamic(
  () => import('@app/components/CreateDatasourceModal'),
  {
    ssr: false,
  }
);

export default function AgentPage() {
  const router = useRouter();
  const [state, setState] = useStateReducer({
    currentDatastoreId: undefined as string | undefined,
  });

  const getAgentQuery = useSWR<Prisma.PromiseReturnType<typeof getAgent>>(
    `/api/agents/${router.query?.agentId}`,
    fetcher
  );

  // const getApiKeysQuery = useSWR<Prisma.PromiseReturnType<typeof getApiKeys>>(
  //   `/api/datastores/${router.query?.datastoreId}/api-keys`,
  //   fetcher
  // );

  const handleDeleteAgent = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this agent? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/agents/${getAgentQuery?.data?.id}`);

      router.push(RouteNames.AGENTS);
    }
  };

  const handleCreatApiKey = async () => {
    await axios.post(`/api/datastores/${getAgentQuery?.data?.id}/api-keys`);

    getAgentQuery.mutate();
  };

  const handleDeleteApiKey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this api key?')) {
      await axios.delete(
        `/api/datastores/${getAgentQuery?.data?.id}/api-keys`,
        {
          data: {
            apiKeyId: id,
          },
        }
      );

      getAgentQuery.mutate();
    }
  };

  const handleBulkDelete = async (datasourceIds: string[]) => {
    if (window.confirm('Are you sure you want to delete these datasources?')) {
      await axios.post('/api/datasources/bulk-delete', {
        ids: datasourceIds,
        datastoreId: getAgentQuery?.data?.id,
      } as BulkDeleteDatasourcesSchema);

      await getAgentQuery.mutate();
    }
  };

  // React.useEffect(() => {
  //   if (!router.query.tab) {
  //     handleChangeTab('datasources');
  //   }
  // }, [router.query.tab]);

  if (!getAgentQuery?.data) {
    return null;
  }

  const agent = getAgentQuery?.data;

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pt: {
          // xs: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // sm: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // md: 3,
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
        // height: '100dvh',
        width: '100%',
        gap: 1,
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
          <Link href={RouteNames.AGENTS}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              Agents
            </Typography>
          </Link>

          <Typography fontSize="inherit" color="neutral">
            {getAgentQuery?.data?.name}
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
            // '& > *': {
            //   minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
            //   flexGrow: 1,
            // },
          }}
        >
          <Stack gap={2}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <Typography level="h1" fontSize="xl4">
                {getAgentQuery?.data?.name}
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={
                  {
                    public: 'success',
                    private: 'neutral',
                  }[getAgentQuery?.data?.visibility!] as ColorPaletteProp
                }
              >
                {getAgentQuery?.data?.visibility}
              </Chip>
            </Box>
            <Stack direction={'row'} gap={2}>
              <Link
                href={`${RouteNames.CHAT}?agentId=${getAgentQuery?.data?.id}`}
              >
                <Button
                  size="sm"
                  variant="plain"
                  startDecorator={<MessageRoundedIcon />}
                  sx={{ mr: 'auto' }}
                >
                  Chat with Agent
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {
          <Box
            sx={(theme) => ({
              maxWidth: '100%',
              width: theme.breakpoints.values.md,
              mx: 'auto',
            })}
          >
            <AgentForm
              onSubmitSucces={() => getAgentQuery.mutate()}
              defaultValues={{
                ...getAgentQuery?.data,
                tools: [...agent.tools.map((each) => agentToolFormat(each))],
              }}
            />

            <Divider sx={{ my: 4 }} />

            <FormControl sx={{ gap: 1 }}>
              <FormLabel>Agent ID</FormLabel>
              <Typography level="body3" mb={2}>
                Use the Agent ID to query the agent through Databerry API
              </Typography>
              <Stack spacing={2}>
                <Alert
                  color="info"
                  startDecorator={<HelpOutlineRoundedIcon />}
                  endDecorator={
                    <Link href="https://docs.databerry.ai" target="_blank">
                      <Button
                        variant="plain"
                        size="sm"
                        endDecorator={<ArrowForwardRoundedIcon />}
                      >
                        Documentation
                      </Button>
                    </Link>
                  }
                >
                  Learn more about the Datatberry API
                </Alert>

                <Alert color="neutral">{getAgentQuery?.data?.id}</Alert>
              </Stack>
            </FormControl>

            <Divider sx={{ my: 4 }} />

            <FormControl sx={{ gap: 1 }}>
              <FormLabel>Delete Agent</FormLabel>
              <Typography level="body3">
                It will delete the agent permanently
              </Typography>
              <Button
                color="danger"
                sx={{ mr: 'auto', mt: 2 }}
                startDecorator={<DeleteIcon />}
                onClick={handleDeleteAgent}
              >
                Delete
              </Button>
            </FormControl>
          </Box>
        }
      </>
    </Box>
  );
}

AgentPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
