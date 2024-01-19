import AddIcon from '@mui/icons-material/Add';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { CircularProgress, type ColorPaletteProp } from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Stack from '@mui/joy/Stack';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';

import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';

import guardDataProcessingUsage from '@chaindesk/lib/guard-data-processing-usage';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { prisma } from '@chaindesk/prisma/client';

const CreateDatasourceModal = dynamic(
  () => import('@app/components/CreateDatasourceModal'),
  {
    ssr: false,
  }
);

const DatastoreSettings = dynamic(
  () => import('@app/components/DatastoreSettings'),
  {
    ssr: false,
  }
);

const Datasources = dynamic(() => import('@app/components/Datasources'), {
  ssr: false,
});

export default function DatastorePage() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isCreateDatasourceModalOpen: false,
    currentDatastoreId: undefined as string | undefined,
    isUsageLimitModalOpen: false,
  });

  const { getDatastoreQuery } = useGetDatastoreQuery({});

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  React.useEffect(() => {
    if (router.isReady && typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('datasources');
    }
  }, [router.isReady, router.query.tab]);

  if (!getDatastoreQuery?.data) {
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
        height: '100%',
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
          <Link href={RouteNames.DATASTORES}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              Datastores
            </Typography>
          </Link>

          <Typography fontSize="inherit" color="neutral">
            {getDatastoreQuery?.data?.name}
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
            mt: 1,
            gap: 1,
            flexWrap: 'wrap',
            // '& > *': {
            //   minWidth: 'clamp(0px, (500px - 100%) * 999, 100%)',
            //   flexGrow: 1,
            // },
          }}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <Typography level="h1" fontSize="xl4">
              {getDatastoreQuery?.data?.name}
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color={
                {
                  public: 'success',
                  private: 'neutral',
                }[getDatastoreQuery?.data?.visibility!] as ColorPaletteProp
              }
            >
              {getDatastoreQuery?.data?.visibility}
            </Chip>
          </Box>

          <Box
            sx={{
              display: 'flex',
              ml: 'auto',
              gap: 2,
              '& > *': { flexGrow: 1 },
            }}
          >
            <Button
              variant="solid"
              color="primary"
              startDecorator={<AddIcon />}
              onClick={() => {
                try {
                  guardDataProcessingUsage({
                    usage: session?.organization.usage!,
                    plan: session?.organization.currentPlan!,
                  });

                  setState({ isCreateDatasourceModalOpen: true });
                } catch {
                  setState({ isUsageLimitModalOpen: true });
                }
              }}
            >
              Add Datasource
            </Button>
          </Box>
        </Box>

        <Stack
          direction={'row'}
          alignItems={'center'}
          gap={2}
          sx={{
            width: '100%',
            mb: 4,
            mt: 4,
          }}
        >
          <Tabs
            aria-label="Tabs"
            value={(router.query.tab as string) || 'datasources'}
            size="md"
            // variant='plain'
            sx={{
              // borderRadius: 'lg',
              // display: 'inline-flex',
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
                // pt: 2,
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
              <Tab indicatorInset value={'datasources'}>
                <ListItemDecorator>
                  <AutoGraphRoundedIcon />
                </ListItemDecorator>
                Datasources
              </Tab>
              <Tab indicatorInset value={'settings'}>
                <ListItemDecorator>
                  <SettingsIcon />
                </ListItemDecorator>
                Settings
              </Tab>
            </TabList>
          </Tabs>

          {/* <Link href="#chatgpt-plugin"> */}
          {/* <Button
            onClick={() => {
              handleChangeTab('settings');
              setTimeout(() => {
                window.location.hash = '#chatgpt-plugin';
              }, 100);
            }}
            size="sm"
            variant="plain"
            startDecorator={<LinkRoundedIcon />}
          >
            ChatGPT Plugin
          </Button> */}
          {/* </Link> */}
        </Stack>

        {/* <Divider sx={{ my: 4 }} /> */}

        {router.query.tab === 'datasources' && getDatastoreQuery?.data?.id && (
          <Datasources datastoreId={getDatastoreQuery?.data?.id} />
        )}

        {getDatastoreQuery?.data && router.query.tab === 'settings' && (
          <Box
            sx={{
              height: '100%',
              overflowY: 'scroll',
              mt: -5,
              pt: 4,
            }}
          >
            <DatastoreSettings />
          </Box>
        )}

        <CreateDatasourceModal
          isOpen={state.isCreateDatasourceModalOpen}
          datastoreId={getDatastoreQuery?.data?.id}
          onSubmitSuccess={() => {
            getDatastoreQuery.mutate();
          }}
          handleClose={() => {
            setState({
              isCreateDatasourceModalOpen: false,
              currentDatastoreId: undefined,
            });
          }}
        />
      </>

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

DatastorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {},
//     };
//   }
// );
