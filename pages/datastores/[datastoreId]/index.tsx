import AddIcon from '@mui/icons-material/Add';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsIcon from '@mui/icons-material/Settings';
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
  IconButton,
  Input,
  Link as JoyLink,
  ListItemDecorator,
  Sheet,
  Stack,
  Tab,
  tabClasses,
  TabList,
  Tabs,
  Typography,
} from '@mui/joy';
import { DatastoreVisibility, Prisma } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import CreateDatasourceModal from '@app/components/CreateDatasourceModal';
import DatasourceTable from '@app/components/DatasourceTable';
import { DatastoreFormsMap } from '@app/components/DatastoreForms';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { getDatastore } from '@app/pages/api/datastores/[id]';
import { getApiKeys } from '@app/pages/api/datastores/[id]/api-keys';
import { RouteNames } from '@app/types';
import getRootDomain from '@app/utils/get-root-domain';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getDatastores } from '../../api/datastores';

export default function DatastorePage() {
  const router = useRouter();
  const [state, setState] = useStateReducer({
    isCreateDatasourceModalOpen: false,
    currentDatastoreId: undefined as string | undefined,
  });

  const getDatastoreQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastore>
  >(`/api/datastores/${router.query?.datastoreId}`, fetcher, {
    refreshInterval: 5000,
  });

  const getApiKeysQuery = useSWR<Prisma.PromiseReturnType<typeof getApiKeys>>(
    `/api/datastores/${router.query?.datastoreId}/api-keys`,
    fetcher
  );

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.push(router);
  };

  const handleSynchDatasource = async (datasourceId: string) => {
    await axios.post(`/api/datasources/${datasourceId}/synch`);

    getDatastoreQuery.mutate();
  };

  const handleDeleteDatastore = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this datastore? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/datastores/${getDatastoreQuery?.data?.id}`);

      router.push(RouteNames.DATASTORES);
    }
  };

  const handleCreatApiKey = async () => {
    await axios.post(`/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`);

    getApiKeysQuery.mutate();
  };

  const handleDeleteApiKey = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this api key?')) {
      await axios.delete(
        `/api/datastores/${getDatastoreQuery?.data?.id}/api-keys`,
        {
          data: {
            apiKeyId: id,
          },
        }
      );

      getApiKeysQuery.mutate();
    }
  };

  React.useEffect(() => {
    if (!router.query.tab) {
      handleChangeTab('datasources');
    }
  }, [router.query.tab]);

  if (!getDatastoreQuery?.data) {
    return null;
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
            mb: 2,
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
              onClick={() => setState({ isCreateDatasourceModalOpen: true })}
            >
              Add Datasource
            </Button>
          </Box>
        </Box>

        <Tabs
          aria-label="Icon tabs"
          defaultValue={(router.query.tab as string) || 'datasources'}
          size="md"
          sx={{
            borderRadius: 'lg',
            display: 'inline-flex',
            mr: 'auto',
            //   mt: 4,
          }}
          onChange={(event, value) => {
            handleChangeTab(value as string);
          }}
        >
          <TabList size="sm">
            <Tab value={'datasources'}>
              <ListItemDecorator>
                <AutoGraphRoundedIcon />
              </ListItemDecorator>
              Datasources
            </Tab>
            <Tab value={'settings'}>
              <ListItemDecorator>
                <SettingsIcon />
              </ListItemDecorator>
              Settings
            </Tab>
          </TabList>
        </Tabs>

        <Divider sx={{ my: 4 }} />

        {router.query.tab === 'datasources' &&
          getDatastoreQuery?.data?.datasources && (
            <DatasourceTable
              items={getDatastoreQuery?.data?.datasources}
              handleSynch={handleSynchDatasource}
            />
          )}

        {getDatastoreQuery?.data && router.query.tab === 'settings' && (
          <Box
            sx={(theme) => ({
              maxWidth: '100%',
              width: theme.breakpoints.values.md,
              mx: 'auto',
            })}
          >
            {React.createElement(
              DatastoreFormsMap?.[getDatastoreQuery?.data?.type!],
              {
                onSubmitSuccess: () => {
                  getDatastoreQuery.mutate();
                },
                defaultValues: {
                  ...getDatastoreQuery?.data,
                  isPublic:
                    getDatastoreQuery?.data?.visibility ===
                    DatastoreVisibility.public,
                } as any,
                submitButtonText: 'Update',
                submitButtonProps: {
                  // variant: 'contained',
                  variant: 'outlined',
                  className: 'ml-auto',
                },
              }
            )}

            <Divider sx={{ my: 4 }} />
            <FormControl sx={{ gap: 1 }}>
              <FormLabel>Api Keys</FormLabel>
              <Typography level="body3">
                Use the api key to access the datastore when private
              </Typography>

              <Stack direction={'column'} gap={2} mt={2}>
                {getApiKeysQuery?.data?.map((each) => (
                  <>
                    <Stack key={each.id} direction={'row'} gap={2}>
                      <Alert color="neutral" sx={{ width: '100%' }}>
                        {each.key}
                      </Alert>

                      <IconButton
                        color="danger"
                        variant="outlined"
                        onClick={() => handleDeleteApiKey(each.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </>
                ))}
              </Stack>

              <Button
                startDecorator={<AddIcon />}
                sx={{ mt: 3, ml: 'auto' }}
                variant="outlined"
                onClick={handleCreatApiKey}
              >
                Create Api Key
              </Button>
            </FormControl>

            <Divider sx={{ my: 4 }} />

            <FormControl sx={{ gap: 1 }}>
              <FormLabel>Api Endpoints</FormLabel>
              <Typography level="body3">
                Here are the endpoints to interact with the datastore
              </Typography>

              <Stack>
                <Stack gap={2} mt={2}>
                  <Typography level="body2">Query</Typography>
                  <Typography level="body3">
                    Retrieve data from the datastore
                  </Typography>
                  <Alert color="neutral" sx={{ width: '100%' }}>
                    <Typography whiteSpace={'pre-wrap'}>
                      {`curl -X POST ${`https://${
                        getDatastoreQuery?.data?.id
                      }.${getRootDomain(
                        process.env.NEXT_PUBLIC_DASHBOARD_URL!
                      )}/query \\`}
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer ${
    getApiKeysQuery?.data?.[0]?.key || 'DATASTORE_API_KEY'
  }' \\
  -d '${JSON.stringify({
    queries: [
      {
        query: 'What are the top 3 post on hacker news?',
        filter: {
          tags: ['a', 'b', 'c'],
        },
        top_k: 3,
      },
    ],
  })}'`}
                    </Typography>
                  </Alert>
                </Stack>
              </Stack>
            </FormControl>

            <Divider sx={{ my: 4 }} />

            <FormControl sx={{ gap: 1 }}>
              <FormLabel>ChatGPT Plugin</FormLabel>
              <Typography level="body3">
                Configuration files for the ChatGPT Plugin are generated
                automatically
              </Typography>

              <Stack>
                <Stack gap={2} mt={2}>
                  <Typography level="body2">ai-plugin.json</Typography>
                  <Alert color="neutral" sx={{ width: '100%' }}>
                    {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                      process.env.NEXT_PUBLIC_DASHBOARD_URL!
                    )}/.well-known/ai-plugin.json`}
                  </Alert>
                </Stack>
                <Stack gap={2} mt={2}>
                  <Typography level="body2">openapi.yaml</Typography>
                  <Alert color="neutral" sx={{ width: '100%' }}>
                    {`https://${getDatastoreQuery?.data?.id}.${getRootDomain(
                      process.env.NEXT_PUBLIC_DASHBOARD_URL!
                    )}/.well-known/openapi.yaml`}
                  </Alert>
                </Stack>
              </Stack>
            </FormControl>

            <Divider sx={{ my: 4 }} />

            <FormControl sx={{ gap: 1 }}>
              <FormLabel>Delete Datastore</FormLabel>
              <Typography level="body3">
                It will delete the datastore and all its datasources
              </Typography>
              <Button
                color="danger"
                sx={{ mr: 'auto', mt: 2 }}
                startDecorator={<DeleteIcon />}
                onClick={handleDeleteDatastore}
              >
                Delete
              </Button>
            </FormControl>
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
    </Box>
  );
}

DatastorePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
