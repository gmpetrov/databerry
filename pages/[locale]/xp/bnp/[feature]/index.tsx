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
  const feature = router.query.feature as 'qa' | 'writing' | 'summary';

  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    userName: undefined as string | undefined,
    useCases: [] as string[],
    currentUseCase: undefined as string | undefined,
    hasSelectedUseCase: false,
    currentDatastore: undefined as
      | Prisma.PromiseReturnType<typeof getDatastores>[0]
      | undefined,

    isCreateDatastoreModalOpen: false,
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  React.useEffect(() => {
    const userName = localStorage.getItem('userName');
    const useCases = localStorage.getItem(`${userName}_${feature}_useCases`);

    if (userName) {
      setState({ userName });
    }

    try {
      const arr = JSON.parse(useCases || '[]');
      setState({ useCases: arr });
    } catch {}

    if (!userName) {
      router.push('/xp/bnp');
    }
  }, []);

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
          <Typography>{XPBNPLabels[feature] || feature}</Typography>
        </Breadcrumbs>

        <Card
          sx={{ p: 4, maxWidth: 'sm', overflow: 'visible' }}
          variant="outlined"
        >
          {!state.hasSelectedUseCase && (
            <Stack gap={4}>
              <form className="flex flex-col space-y-4">
                <FormControl>
                  <FormLabel>Selectionner Use-case</FormLabel>
                  <Select
                    value={state.currentUseCase}
                    onChange={(_, value) => {
                      setState({ currentUseCase: value as string });
                    }}
                  >
                    {state.useCases.map((useCase, index) => (
                      <Option key={index} value={useCase}>
                        {useCase}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
                {state.currentUseCase && (
                  <Button
                    endDecorator={<ArrowForwardRoundedIcon />}
                    sx={{ ml: 'auto' }}
                    onClick={() =>
                      router.push(`/xp/bnp/${feature}/${state.currentUseCase}`)
                    }
                  >
                    Suivant
                  </Button>
                )}
              </form>

              <Divider></Divider>

              <form
                className="flex flex-col space-y-4"
                onSubmit={(e: any) => {
                  e.preventDefault();

                  const data = new FormData(e.target);
                  const useCase = data.get('useCase') as string;

                  if (useCase) {
                    const arr = [...state.useCases, useCase];
                    localStorage.setItem(
                      `${state.userName}_${feature}_useCases`,
                      JSON.stringify(arr)
                    );
                    setState({ useCases: arr, currentUseCase: useCase });
                    e.target.reset();
                  }
                }}
              >
                <FormControl>
                  <FormLabel>Use Case</FormLabel>
                  <Input name="useCase"></Input>
                </FormControl>
                <Button sx={{ ml: 'auto' }} type="submit" variant="outlined">
                  Créer
                </Button>
              </form>
            </Stack>
          )}
        </Card>
      </Stack>
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
