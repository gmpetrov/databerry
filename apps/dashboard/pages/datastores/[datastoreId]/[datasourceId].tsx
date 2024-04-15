import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { CircularProgress, type ColorPaletteProp, Stack } from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';

import Layout from '@app/components/Layout';
import { HEADER_HEIGHT } from '@app/components/Layout/Header';
import { getDatasource } from '@app/pages/api/datasources/[id]';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

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
        overflowY: 'scroll',
        height: `calc(100dvh  - ${HEADER_HEIGHT}px - 50px)`,
        maxHeight: `calc(100dvh  - ${HEADER_HEIGHT}px) - 50px`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        gap: 1,
      })}
    >
      <>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
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
                  running: 'neutral',
                  synched: 'success',
                  error: 'danger',
                  usage_limit_reached: 'warning',
                }[getDatasourceQuery?.data?.status!] as ColorPaletteProp
              }
            >
              {getDatasourceQuery?.data?.status}
            </Chip>
          </Box>
        </Box>

        <Divider />

        <Box
          sx={(theme) => ({
            maxWidth: '100%',
            width: '100%',
            mx: 'auto',
            mt: 4,
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
            <Typography level="body-xs">
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
      </>
    </Box>
  );
}

DatasourcePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
