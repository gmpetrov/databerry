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
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import DatastoreTable from '@app/components/DatastoreTable';
import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';

import accountConfig from '@chaindesk/lib/account-config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

import { getDatastores } from '../api/datastores';

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

export default function DatasourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [state, setState] = useStateReducer({
    isCreateDatastoreModalOpen: false,
    isCreateDatasourceModalV2Open: false,
    currentDatastoreId: undefined as string | undefined,
    isUsageModalOpen: false,
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const handleClickNewDatastore = () => {
    if (
      (getDatastoresQuery?.data?.length || 0) >=
      accountConfig[session?.organization?.currentPlan!]?.limits?.maxDatastores
    ) {
      setState({ isUsageModalOpen: true });
    } else {
      setState({ isCreateDatastoreModalOpen: true });
    }
  };

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
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
        <Typography level="title-lg">Datastores</Typography>
        <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
          <Button
            variant="solid"
            color="primary"
            startDecorator={<AddIcon />}
            onClick={handleClickNewDatastore}
          >
            New Datastore
          </Button>
        </Box>
      </Box>

      <Alert
        variant="soft"
        color="neutral"
        startDecorator={<InfoRoundedIcon />}
        sx={{ mb: 2 }}
      >
        A Datastore serves as a repository that contains various types of data
        sources, including files, web pages, Notion notebooks, etc.. Once data
        is uploaded to a Datastore, it undergoes processing (vectorization) to
        prepare it for use by an Agent (Large Language Model).
      </Alert>

      {getDatastoresQuery?.data && (
        <DatastoreTable items={getDatastoresQuery.data} />
      )}

      <CreateDatastoreModal
        isOpen={state.isCreateDatastoreModalOpen}
        onSubmitSuccess={(datastore) => {
          getDatastoresQuery.mutate();

          router.push(`/datastores/${datastore.id}`);
        }}
        handleClose={() => {
          setState({ isCreateDatastoreModalOpen: false });
        }}
      />

      <UsageLimitModal
        isOpen={state.isUsageModalOpen}
        handleClose={() => setState({ isUsageModalOpen: false })}
      />
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = withAuth(async (ctx) => {
//   return {
//     props: {},
//   };
// });
