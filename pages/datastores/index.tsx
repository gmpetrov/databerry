import AddIcon from '@mui/icons-material/Add';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import {
  Box,
  Breadcrumbs,
  Button,
  Link as JoyLink,
  Typography,
} from '@mui/joy';
import { Prisma, SubscriptionPlan } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import CreateDatastoreModal from '@app/components/CreateDatastoreModal';
import DatastoreTable from '@app/components/DatastoreTable';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getDatastores } from '../api/datastores';

export default function DatasourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [state, setState] = useStateReducer({
    isCreateDatastoreModalOpen: false,
    isCreateDatasourceModalV2Open: false,
    currentDatastoreId: undefined as string | undefined,
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const handleClickNewDatastore = () => {
    if (
      session?.user?.plan === SubscriptionPlan.free &&
      (getDatastoresQuery?.data?.length || 0) >= 1
    ) {
      alert(
        `You're limited to 1 datastore on the free plan. Contact support@databerry.ai to upgrade your account.`
      );
    } else {
      setState({ isCreateDatastoreModalOpen: true });
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
          Datastores
        </Typography>
        {/* <JoyLink
          underline="hover"
          color="neutral"
          fontSize="inherit"
          href="#some-link"
        >
          Datastores
        </JoyLink> */}
        {/* <Typography fontSize="inherit" variant="soft" color="primary">
          Orders
        </Typography> */}
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
          Datastores
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
            onClick={handleClickNewDatastore}
          >
            New Datastore
          </Button>
        </Box>
      </Box>

      {getDatastoresQuery?.data && (
        <DatastoreTable items={getDatastoresQuery.data} />
      )}

      <CreateDatastoreModal
        isOpen={state.isCreateDatastoreModalOpen}
        onSubmitSuccess={() => {
          getDatastoresQuery.mutate();
        }}
        handleClose={() => {
          setState({ isCreateDatastoreModalOpen: false });
        }}
      />
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
