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
import axios from 'axios';
import cuid from 'cuid';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import AgentForm from '@app/components/AgentForm';
import GeneralInput from '@app/components/AgentInputs/GeneralInput';
import ModelInput from '@app/components/AgentInputs/ModelInput';
import ToolsInput from '@app/components/AgentInputs/ToolsInput';
import FormsTable from '@app/components/FormsTable';
import Layout from '@app/components/Layout';
import SettingCard from '@app/components/ui/SettingCard';
import UsageLimitModal from '@app/components/UsageLimitModal';
import { getProductFromHostname } from '@app/hooks/useProduct';
import useStateReducer from '@app/hooks/useStateReducer';

import accountConfig from '@chaindesk/lib/account-config';
import { CUSTOMER_SUPPORT_V3 } from '@chaindesk/lib/prompt-templates';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateFormSchema, FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Agent, AgentModelName, Form, Prisma } from '@chaindesk/prisma';

import { getAgents } from '../api/agents';
import { getDatastores } from '../api/datastores';
import { createForm, getForms } from '../api/forms';

export default function FormsPage() {
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

  const getFormsQuery = useSWR<Prisma.PromiseReturnType<typeof getForms>>(
    '/api/forms',
    fetcher
  );

  const formMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createForm>
  >('api/forms/', generateActionFetcher(HTTP_METHOD.POST)<CreateFormSchema>);

  const onSubmit = async () => {
    try {
      const res = await toast.promise(
        formMutation.trigger({
          name: 'untitled',
          draftConfig: {
            fields: [
              {
                id: cuid(),
                type: 'text',
                name: 'email',
                required: true,
              },
            ] as any,
            startScreen: {
              title: 'Welcome to our support!',
              description: 'Please fill out the form below',
              cta: {
                label: 'Start',
              },
            },
            // endScreen: {},
          },
        } as any),
        {
          loading: 'Creating empty form...',
          success: 'Created!',
          error: 'Something went wrong',
        }
      );

      getFormsQuery.mutate();

      if (res?.id) {
        router.push(`${RouteNames.FORMS}/${res.id}/admin`);
      }
    } catch (err) {
      console.log('error', err);
    }
  };
  const handleDeleteForm = async (formId: string) => {
    try {
      await toast.promise(axios.delete(`api/forms/${formId}/admin`), {
        loading: 'Processing',
        success: 'Deleted!',
        error: 'Something went wrong',
      });
      getFormsQuery.mutate();
    } catch (err) {
      console.log('error', err);
    }
  };
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
          Forms
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
          Forms
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
            onClick={onSubmit}
          >
            New Form
          </Button>
        </Box>
      </Box>

      {getAgentsQuery.data && (
        <FormsTable items={getFormsQuery.data as Form[]} />
      )}

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
                  <summary>Model / Prompt Settings</summary>
                  <ModelInput />
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

FormsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
