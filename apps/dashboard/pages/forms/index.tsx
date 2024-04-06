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
import useModal from '@app/hooks/useModal';

import {
  CONTACT_SALES,
  FEEDBACK,
  FROM_SCRATCH,
  INBOUND_LEAD,
  LEAD_FORM,
  ONBOARDING_FORM,
  PRODUCT_FEEDBACK_FORM,
} from '@chaindesk/lib/forms/templates';
import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateFormSchema, FormConfigSchema } from '@chaindesk/lib/types/dtos';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Form, Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';
import Loader from '@chaindesk/ui/Loader';

import { getAgents } from '../api/agents';
import { createForm, getForms } from '../api/forms';

export default function FormsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const createFormModal = useModal();

  const [state, setState] = useStateReducer({
    isCreateDatastoreModalOpen: false,
    isCreateDatasourceModalV2Open: false,
    currentDatastoreId: undefined as string | undefined,
    isAgentModalOpen: false,
    isUsageLimitModalOpen: false,
  });

  const getFormsQuery = useSWR<Prisma.PromiseReturnType<typeof getForms>>(
    '/api/forms',
    fetcher
  );

  const formMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createForm>
  >('api/forms/', generateActionFetcher(HTTP_METHOD.POST)<CreateFormSchema>);

  const onSubmit = async (schema: FormConfigSchema) => {
    try {
      const res = await toast.promise(
        formMutation.trigger({
          draftConfig: schema,
        } as any),
        {
          loading: 'Creating Form...',
          success: 'Created',
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

  if (!getFormsQuery.data && getFormsQuery.isLoading) {
    return <Loader />;
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
        <Typography fontSize="inherit" color="primary">
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
            onClick={() => {
              createFormModal.open();
            }}
            loading={formMutation.isMutating}
          >
            New Form
          </Button>
        </Box>
      </Box>

      {getFormsQuery.data && (
        <FormsTable items={getFormsQuery.data as Form[]} />
      )}

      <UsageLimitModal
        isOpen={state.isUsageLimitModalOpen}
        handleClose={() =>
          setState({
            isUsageLimitModalOpen: false,
          })
        }
      />

      <createFormModal.component
        title="Create Form"
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <Stack gap={2}>
          {[
            FROM_SCRATCH,
            LEAD_FORM,
            ONBOARDING_FORM,
            PRODUCT_FEEDBACK_FORM,
            INBOUND_LEAD,
            CONTACT_SALES,
            FEEDBACK,
          ].map((each) => (
            <Card
              size="sm"
              key={each.name}
              onClick={() => onSubmit(each.schema)}
              variant="outlined"
              sx={(t) => ({
                transition: 'all 0.1s ease-in-out',
                '&:hover': {
                  backgroundColor: t.palette.background.popup,
                  cursor: 'pointer',
                  transform: 'scale(1.005)',
                  '& > p:first-child': {
                    color: t.palette.primary.main,
                  },
                },
              })}
            >
              <Typography level="title-lg">{each.name}</Typography>
              <Typography level="body-md">{each.description}</Typography>
            </Card>
          ))}
        </Stack>
      </createFormModal.component>
    </Box>
  );
}

FormsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
