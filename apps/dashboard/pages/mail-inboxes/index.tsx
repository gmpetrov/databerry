import AddIcon from '@mui/icons-material/Add';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Link as JoyLink,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import EmailInboxesTable from '@app/components/EmailInboxesTable';
import Layout from '@app/components/Layout';
import Loader from '@app/components/Loader';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useStateReducer from '@app/hooks/useStateReducer';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateMailInboxSchema } from '@chaindesk/lib/types/dtos';
import { Form, Prisma } from '@chaindesk/prisma';

import { createEmailInbox, getEmailInboxes } from '../api/mail-inboxes';

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

  const getMailInboxesQuery = useSWR<
    Prisma.PromiseReturnType<typeof getEmailInboxes>
  >('/api/mail-inboxes', fetcher);

  const mailInboxMutation = useSWRMutation<
    Prisma.PromiseReturnType<typeof createEmailInbox>,
    any,
    any,
    CreateMailInboxSchema
  >(
    'api/mail-inboxes',
    generateActionFetcher(HTTP_METHOD.POST)<CreateMailInboxSchema>
  );

  const onSubmit = async () => {
    try {
      const res = await toast.promise(mailInboxMutation.trigger({}), {
        loading: 'Creating Form...',
        success: 'Created',
        error: 'Something went wrong',
      });

      getMailInboxesQuery.mutate();

      if (res?.id) {
        router.push(`${RouteNames.EMAIL_INBOXES}/${res.id}`);
      }
    } catch (err) {
      console.log('error', err);
    }
  };

  if (!getMailInboxesQuery.data && getMailInboxesQuery.isLoading) {
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
          Email Inboxes
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
          Email Inboxes
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
                getMailInboxesQuery.data &&
                getMailInboxesQuery.data?.length > 0 &&
                !session?.organization?.isPremium
              ) {
                setState({
                  isUsageLimitModalOpen: true,
                });
                return;
              }
              onSubmit();
            }}
            loading={
              mailInboxMutation.isMutating || getMailInboxesQuery.isLoading
            }
          >
            New Email Inbox
          </Button>
        </Box>
      </Box>

      <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
        sx={{ mb: 2 }}
      >
        Receive your support emails in Chaindesk. Emails are working as
        redirections, forwarding for instance contact@yourcompany.com to your
        Chaindesk inbox. You will love it!
      </Alert>

      {getMailInboxesQuery.data && (
        <EmailInboxesTable items={getMailInboxesQuery.data} />
      )}

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
