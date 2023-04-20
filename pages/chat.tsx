import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Input,
  Link as JoyLink,
  Option,
  Select,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import ChatBox from '@app/components/ChatBox';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';
import { RouteNames } from '@app/types';
import { fetcher } from '@app/utils/swr-fetcher';
import { withAuth } from '@app/utils/withAuth';

import { getDatastores } from './api/datastores';

const Schema = z.object({ query: z.string().min(1) });

export default function DatasourcesPage() {
  const [state, setState] = useStateReducer({
    currentDatastoreId: undefined as string | undefined,
    history: [] as { from: 'human' | 'agent'; message: string }[],
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const onSubmit = async (query: string) => {
    if (!query || !state.currentDatastoreId) return;

    const history = [
      ...state.history,
      { from: 'human', message: query as string },
    ];

    setState({
      history: history as any,
    });

    const result = await axios.post(
      `/api/datastores/${state.currentDatastoreId}/chat`,
      {
        query: query,
      }
    );

    setState({
      history: [
        ...history,
        { from: 'agent', message: result.data.answer as string },
      ] as any,
    });
  };

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        px: {
          xs: 2,
          md: 6,
        },
        pt: {},
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
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
        <Typography level="h1" fontSize="xl4">
          Chat
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, '& > *': { flexGrow: 1 } }}>
          <Select
            placeholder="Select a Datastore to query"
            onChange={(_, value) => {
              setState({ currentDatastoreId: value as string });
            }}
          >
            {getDatastoresQuery?.data?.map((datastore) => (
              <Option key={datastore.id} value={datastore.id}>
                {datastore.name}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>

      <Divider sx={{ mt: 2 }} />

      {(getDatastoresQuery?.data?.length || 0) > 0 &&
        !state?.currentDatastoreId && (
          <Alert
            color="warning"
            variant="soft"
            sx={{ mx: 'auto', mt: 6 }}
            size="lg"
          >
            {`Select the datastore you want to query.`}
          </Alert>
        )}

      {(getDatastoresQuery?.data?.length || 0) <= 0 && (
        <Card variant="outlined" sx={{ mx: 'auto', mt: 6, p: 4 }}>
          <Stack gap={4}>
            <Typography level="h5">
              {`You don't have any datastores yet. Please create one first.`}
            </Typography>

            <Link href={RouteNames.DATASTORES}>
              <Button
                sx={{ mr: 'auto' }}
                endDecorator={<ArrowForwardRoundedIcon />}
              >
                Create Datastore
              </Button>
            </Link>
          </Stack>
        </Card>
      )}

      {(getDatastoresQuery?.data?.length || 0) > 0 && (
        <ChatBox messages={state.history} onSubmit={onSubmit} />
      )}
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
