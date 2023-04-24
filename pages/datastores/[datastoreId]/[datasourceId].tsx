import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import type { ColorPaletteProp } from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';

import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { getDatasource } from '@app/pages/api/datasources/[id]';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

const DatasourceForm = dynamic(
  () => import('@app/components/DatasourceForms'),
  {
    ssr: false,
  }
);

export default function DatasourcePage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [state, setState] = useStateReducer({
    isCreateDatasourceModalOpen: false,
    currentDatastoreId: undefined as string | undefined,
  });

  const getDatasourceQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatasource>
  >(`/api/datasources/${router.query?.datasourceId}`, fetcher);

  const handleDeleteDatasource = async (id: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this datasource? This action is irreversible.'
      )
    ) {
      await axios.delete(`/api/datasources/${id}`);

      mutate(`/api/datastores/${router.query?.datastoreId}`);

      router.push(`${RouteNames.DATASTORES}/${router.query?.datastoreId}`);
    }
  };

  if (!getDatasourceQuery?.data) {
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
          <Link href={`${RouteNames.DATASTORES}/${router.query.datastoreId}`}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              {getDatasourceQuery?.data?.datastore?.name}
            </Typography>
          </Link>

          <Typography fontSize="inherit" color="neutral">
            {getDatasourceQuery?.data?.name}
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
              {getDatasourceQuery?.data?.name}
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color={
                {
                  unsynched: 'neutral',
                  pending: 'primary',
                  running: 'info',
                  synched: 'success',
                  error: 'danger',
                  usage_limit_reached: 'warning',
                }[getDatasourceQuery?.data?.status!] as ColorPaletteProp
              }
            >
              {getDatasourceQuery?.data?.status}
            </Chip>
          </Box>

          {/* <Box
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
              Create Datasource
            </Button>
          </Box> */}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box
          sx={(theme) => ({
            maxWidth: '100%',
            width: theme.breakpoints.values.md,
            mx: 'auto',
          })}
        >
          {getDatasourceQuery?.data?.type && (
            <DatasourceForm
              type={getDatasourceQuery?.data?.type}
              onSubmitSuccess={() => {
                getDatasourceQuery.mutate();
              }}
              defaultValues={getDatasourceQuery?.data as any}
              submitButtonText={'Update'}
              submitButtonProps={{
                size: 'md',
                color: 'primary',
                variant: 'solid',
                className: 'ml-auto',
              }}
            />
          )}

          <Divider sx={{ my: 4 }} />

          <FormControl sx={{ gap: 1 }}>
            <FormLabel>Delete Datasource</FormLabel>
            <Typography level="body3">
              It will remove all its data from the datastore.
            </Typography>
            <Button
              color="danger"
              sx={{ mr: 'auto', mt: 2 }}
              startDecorator={<DeleteIcon />}
              onClick={() =>
                handleDeleteDatasource(getDatasourceQuery?.data?.id!)
              }
            >
              Delete
            </Button>
          </FormControl>
        </Box>

        {/* {getDatastoreQuery?.data && router.query.tab === 'settings' && (
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
                  className: 'ml-auto',
                },
              }
            )}
          </Box>
        )} */}
      </>
    </Box>
  );
}

DatasourcePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
