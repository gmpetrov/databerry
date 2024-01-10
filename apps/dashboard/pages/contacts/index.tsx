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
import useSWR from 'swr';

import ContactsTable from '@app/components/ContactsTable';
import Layout from '@app/components/Layout';
import Loader from '@app/components/Loader';
import useStateReducer from '@app/hooks/useStateReducer';

import {
  fetcher,
  generateActionFetcher,
  HTTP_METHOD,
} from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { CreateMailInboxSchema } from '@chaindesk/lib/types/dtos';
import { Form, Prisma } from '@chaindesk/prisma';

import { getContacts } from '../api/contacts';

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

  const getContactsQuery = useSWR<Prisma.PromiseReturnType<typeof getContacts>>(
    '/api/contacts',
    fetcher
  );

  // const mailInboxMutation = useSWRMutation<
  //   Prisma.PromiseReturnType<typeof createEmailInbox>,
  //   any,
  //   any,
  //   CreateMailInboxSchema
  // >(
  //   'api/mail-inboxes',
  //   generateActionFetcher(HTTP_METHOD.POST)<CreateMailInboxSchema>
  // );

  // const onSubmit = async () => {
  //   try {
  //     const res = await toast.promise(mailInboxMutation.trigger({}), {
  //       loading: 'Creating Form...',
  //       success: 'Created',
  //       error: 'Something went wrong',
  //     });

  //     getContactsQuery.mutate();

  //     if (res?.id) {
  //       router.push(`${RouteNames.EMAIL_INBOXES}/${res.id}`);
  //     }
  //   } catch (err) {
  //     console.log('error', err);
  //   }
  // };

  if (!getContactsQuery.data && getContactsQuery.isLoading) {
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
          Contacts
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
          Contacts
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
          {/* <Button
            variant="solid"
            color="primary"
            startDecorator={<AddIcon />}
            onClick={() => {
              if (
                getContactsQuery.data &&
                getContactsQuery.data?.length > 0 &&
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
              mailInboxMutation.isMutating || getContactsQuery.isLoading
            }
          >
            New Email Inbox
          </Button> */}
        </Box>
      </Box>

      <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
        sx={{ mb: 2 }}
      >
        Contacts by Chaindesk is cutting edge CRM powered by AI. Here you can
        view all leads, customers and contacts that you have collected from your
        Agents or Forms.
      </Alert>

      {getContactsQuery.data && <ContactsTable />}

      {/* <UsageLimitModal
        isOpen={state.isUsageLimitModalOpen}
        handleClose={() =>
          setState({
            isUsageLimitModalOpen: false,
          })
        }
      /> */}
    </Box>
  );
}

FormsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
