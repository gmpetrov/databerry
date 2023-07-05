import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  ColorPaletteProp,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tab from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import Tabs from '@mui/joy/Tabs';
import Typography from '@mui/joy/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Prisma } from '@prisma/client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import CreateDatastoreModal from '@app/components/CreateDatastoreModal';
import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { getDatastores } from '@app/pages/api/datastores';
import { RouteNames } from '@app/types';
import { XPBNPLabels } from '@app/utils/config';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

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

export default function XPBNPFeature() {
  const router = useRouter();
  const useCase = router.query.usecase as string;
  const feature = router.query.feature as 'qa' | 'writing' | 'summary';

  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    userName: undefined as string | undefined,
    isCreateDatasourceModalOpen: false,
    currentDatastore: undefined as
      | Prisma.PromiseReturnType<typeof getDatastores>[0]
      | undefined,

    isCreateDatastoreModalOpen: false,
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  React.useEffect(() => {}, []);

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
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
      <Stack gap={1}>
        <Breadcrumbs separator="›">
          <Link href="/xp/bnp">
            <Typography color="primary">XP Home</Typography>
          </Link>
          <Link href={`/xp/bnp/${feature}`}>
            <Typography color="primary">
              {XPBNPLabels[feature] || feature}
            </Typography>
          </Link>
          <Typography>{useCase}</Typography>
        </Breadcrumbs>

        <Card
          sx={{ p: 4, maxWidth: 'sm', overflow: 'visible' }}
          variant="outlined"
        >
          <Stack gap={2}>
            <form className="flex flex-col mt-4 space-y-4">
              <FormControl>
                <FormLabel>Selectionner un Datastore</FormLabel>
                <Select
                  value={state.currentDatastore?.id}
                  onChange={(_, value) => {
                    const datastore = getDatastoresQuery.data?.find(
                      (datastore) => datastore.id === value
                    );

                    setState({ currentDatastore: datastore });
                  }}
                >
                  {getDatastoresQuery.data?.map((datastore) => (
                    <Option key={datastore.id} value={datastore.id}>
                      {datastore.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>

              <Stack
                direction="row"
                sx={{ width: '100%', justifyContent: 'space-between' }}
              >
                {state.currentDatastore && (
                  <Button
                    color="success"
                    variant="plain"
                    onClick={() => {
                      setState({ isCreateDatasourceModalOpen: true });
                    }}
                  >
                    Ajouter de la donnée dans le datastore
                  </Button>
                )}

                <Button
                  variant="plain"
                  sx={{ ml: 'auto' }}
                  onClick={() => {
                    setState({ isCreateDatastoreModalOpen: true });
                  }}
                >
                  Créer nouveau datastore
                </Button>
              </Stack>
            </form>

            {(state.currentDatastore ||
              (!state.currentDatastore && feature === 'writing')) && (
              <Button
                endDecorator={<ArrowForwardRoundedIcon />}
                sx={{ ml: 'auto' }}
                variant="outlined"
                onClick={() => {
                  router.push(
                    `/xp/bnp/${feature}/${useCase}/${
                      state.currentDatastore?.id || 'none'
                    }`
                  );
                }}
              >
                Suivant
              </Button>
            )}
          </Stack>
        </Card>
      </Stack>

      <CreateDatastoreModal
        isOpen={state.isCreateDatastoreModalOpen}
        onSubmitSuccess={(newDatatore) => {
          getDatastoresQuery.mutate();
          setState({ isCreateDatastoreModalOpen: false });
          setState({ currentDatastore: newDatatore as any });
        }}
        handleClose={() => {
          setState({ isCreateDatastoreModalOpen: false });
        }}
      />

      {state?.currentDatastore?.id && (
        <CreateDatasourceModal
          isOpen={state.isCreateDatasourceModalOpen}
          datastoreId={state.currentDatastore.id}
          handleClose={() => {
            setState({
              isCreateDatasourceModalOpen: false,
            });
          }}
        />
      )}
    </Box>
  );
}

XPBNPFeature.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
