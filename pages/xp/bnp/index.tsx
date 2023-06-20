import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { ColorPaletteProp, FormLabel, Input } from '@mui/joy';
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

import Layout from '@app/components/Layout';
import UsageLimitModal from '@app/components/UsageLimitModal';
import useGetDatastoreQuery from '@app/hooks/useGetDatastoreQuery';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { XPBNPLabels } from '@app/utils/config';
import guardDataProcessingUsage from '@app/utils/guard-data-processing-usage';
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

export default function XPBNPHome() {
  const router = useRouter();

  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    userName: undefined as string | undefined,
    feature: undefined as 'qa' | 'writing' | 'summary' | undefined,
  });

  const handleSaveName = (name: string) => {
    localStorage.setItem('userName', name);
    setState({ userName: name });
  };

  const handleReset = () => {
    localStorage.removeItem('userName');
    setState({ userName: undefined, feature: undefined });
  };

  const handleSetFeature = (feature: any) => {
    if (feature) {
      localStorage.setItem('feature', feature);
      setState({ feature });
    }
  };

  React.useEffect(() => {
    const userName = localStorage.getItem('userName');

    if (userName) {
      setState({ userName });
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
      {!state.userName && (
        <Card sx={{ p: 4, maxWidth: 'sm' }} variant="outlined">
          <form
            onSubmit={(e: any) => {
              e.preventDefault();
              const data = new FormData(e.target);
              const name = data.get('name') as string;

              if (name) {
                handleSaveName(name);
              }
            }}
          >
            <Stack gap={2}>
              <FormLabel>Prénom</FormLabel>
              <Input name="name" required />

              <Button type="submit">Enregistrer</Button>
            </Stack>
          </form>
        </Card>
      )}

      {state.userName && (
        <Stack gap={2}>
          <Card sx={{ p: 4, maxWidth: 'sm' }} variant="outlined">
            <Stack gap={2}>
              <FormLabel>Prénom</FormLabel>
              <Typography color="success" level="h4">
                {state.userName}
              </Typography>
              {/* <Input name="name" value={state.userName} disabled /> */}

              <Button onClick={handleReset} color="warning">
                Se déconnecter
              </Button>
            </Stack>
          </Card>

          <Card sx={{ p: 4, maxWidth: 'sm' }} variant="outlined" title="Usages">
            <Typography level="h4">Usages</Typography>
            <Divider sx={{ my: 2 }}></Divider>

            <Stack gap={1}>
              <Link href="/xp/bnp/qa">
                <Button
                  endDecorator={<ArrowForwardRoundedIcon />}
                  variant="plain"
                >
                  {XPBNPLabels['qa']}
                </Button>
              </Link>
              <Link href="/xp/bnp/writing">
                <Button
                  endDecorator={<ArrowForwardRoundedIcon />}
                  variant="plain"
                >
                  {XPBNPLabels['writing']}
                </Button>
              </Link>
              <Link href="/xp/bnp/summary">
                <Button
                  endDecorator={<ArrowForwardRoundedIcon />}
                  variant="plain"
                >
                  {XPBNPLabels['summary']}
                </Button>
              </Link>
            </Stack>
          </Card>
        </Stack>
      )}
    </Box>
  );
}

XPBNPHome.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
