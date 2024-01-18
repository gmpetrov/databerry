import AddIcon from '@mui/icons-material/Add';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  Divider,
  Link as JoyLink,
  Modal,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import AgentForm from '@app/components/AgentForm';
import GeneralInput from '@app/components/AgentInputs/GeneralInput';
import ModelInput from '@app/components/AgentInputs/ModelInput';
import ToolsInput from '@app/components/AgentInputs/ToolsInput';
import AgentTable from '@app/components/AgentTable';
import Layout from '@app/components/Layout';
import SettingCard from '@app/components/ui/SettingCard';
import UsageLimitModal from '@app/components/UsageLimitModal';
import { getProductFromHostname } from '@app/hooks/useProduct';
import useStateReducer from '@app/hooks/useStateReducer';

import accountConfig from '@chaindesk/lib/account-config';
import { CUSTOMER_SUPPORT_V3 } from '@chaindesk/lib/prompt-templates';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Agent, AgentModelName, Prisma } from '@chaindesk/prisma';

import { getAgents } from '../api/agents';
import { getDatastores } from '../api/datastores';

export default function AgentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [state, setState] = useStateReducer({
    isCreateDatastoreModalOpen: false,
    isCreateDatasourceModalV2Open: false,
    currentDatastoreId: undefined as string | undefined,
    isAgentModalOpen: false,
    isUsageLimitModalOpen: false,
  });

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

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
          Agents
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
          // '& > *': {
          //   minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
          //   flexGrow: 1,
          // },
        }}
      >
        <Typography level="h1" fontSize="xl4">
          Agents
        </Typography>
        {/* <Box sx={{ flex: 999999 }} /> */}
        <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
          {/* <Button
            variant="outlined"
            color="neutral"
            startDecorator={<i data-feather="download-cloud" />}
          >
            Download PDF
          </Button> */}
          <Button
            variant="solid"
            color="primary"
            startDecorator={<AddIcon />}
            onClick={() => {
              if (
                (getAgentsQuery?.data?.length || 0) >=
                accountConfig[session?.organization?.currentPlan!]?.limits
                  ?.maxAgents
              ) {
                return setState({
                  isUsageLimitModalOpen: true,
                });
              }

              setState({ isAgentModalOpen: true });
            }}
          >
            New Agent
          </Button>
        </Box>
      </Box>

      {getAgentsQuery.data && <AgentTable items={getAgentsQuery.data} />}

      <Modal
        onClose={() => setState({ isAgentModalOpen: false })}
        open={state.isAgentModalOpen}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: 600,
            maxWidth: '100%',
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
            overflowY: 'auto',
            maxHeight: '95vh',
          }}
        >
          <Typography level="h3">Agent</Typography>
          <Divider sx={{ my: 4 }} />
          <AgentForm
            onSubmitSucces={(agent: Agent) => {
              setState({ isAgentModalOpen: false });
              if (agent?.id) {
                router.push(`${RouteNames.AGENTS}/${agent.id}`);
              }
            }}
          >
            {({ mutation }) => (
              <Stack gap={4}>
                <GeneralInput />

                <details>
                  <summary>GPT Model / Prompt Settings</summary>
                  <Stack sx={{ pt: 2, px: 1 }}>
                    <ModelInput />
                  </Stack>
                </details>

                <SettingCard
                  title="Tools"
                  disableSubmitButton
                  description="Give tools to your Agent to make it smarter"
                >
                  <ToolsInput />
                </SettingCard>

                <Button
                  type="submit"
                  variant="solid"
                  color="primary"
                  loading={mutation.isMutating}
                  sx={{ ml: 'auto', mt: 2 }}
                  // disabled={!methods.formState.isValid}
                  // startDecorator={<SaveRoundedIcon />}
                >
                  {'Create'}
                </Button>
              </Stack>
            )}
          </AgentForm>
        </Sheet>
      </Modal>
      <UsageLimitModal
        isOpen={state.isUsageLimitModalOpen}
        handleClose={() =>
          setState({
            isUsageLimitModalOpen: false,
          })
        }
      />
    </Box>
  );
}

AgentsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {
//         product: getProductFromHostname(ctx?.req?.headers?.host),
//       },
//     };
//   }
// );
