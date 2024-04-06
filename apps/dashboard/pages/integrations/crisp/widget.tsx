import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Switch,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import z from 'zod';

import { getConversationMetadata } from '@chaindesk/integrations/crisp/api/widget';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { AIStatus } from '@chaindesk/lib/types/crisp';
import { CrispUpdateMetadataSchema } from '@chaindesk/lib/types/dtos';
import { Prisma, ServiceProviderType } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

export default function CrispConfig(props: { isPremium?: boolean }) {
  const [state, setState] = useStateReducer({
    isMetadataLoading: false,
    isAiEnabled: true,
  });
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const getConversationMetadataQuery = useSWR<
    Prisma.PromiseReturnType<typeof getConversationMetadata>
  >(
    `/api/integrations/crisp/widget?website_id=${router.query.website_id}&session_id=${router.query.session_id}&token=${router.query.token}&locale=${router.query.locale}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateIfStale: true,
    }
  );

  const handleUpdateMetadata = async (
    values: Pick<z.infer<typeof CrispUpdateMetadataSchema>, 'aiStatus'>
  ) => {
    const toastId = toast.loading('saving', {
      position: 'bottom-center',
    });
    try {
      setState({
        isMetadataLoading: true,
        isAiEnabled: values.aiStatus === AIStatus.enabled,
      });

      await axios.patch('/api/integrations/crisp/widget', {
        website_id: router.query.website_id,
        session_id: router.query.session_id,
        token: router.query.token,
        locale: router.query.locale,
        ...values,
      } as z.infer<typeof CrispUpdateMetadataSchema>);

      await getConversationMetadataQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({
        isMetadataLoading: false,
      });

      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    setState({
      isAiEnabled:
        !getConversationMetadataQuery?.data?.aiStatus ||
        getConversationMetadataQuery?.data?.aiStatus === 'enabled',
    });
  }, [getConversationMetadataQuery?.data?.aiStatus]);

  const isFormDisabled =
    state.isMetadataLoading || getConversationMetadataQuery.isLoading;

  return (
    <>
      <Head>
        <title>Chaindesk - Crisp Widget</title>
        <meta
          name="description"
          content="Chaindesk is the leading document retrievial platform"
        />
      </Head>
      <Box
        p={0}
        className="flex flex-col items-center justify-start w-screen h-screen overflow-y-auto bg-black"
      >
        {props.isPremium ? (
          <Stack className="w-full mx-auto">
            {submitError && <Alert color="danger">{submitError}</Alert>}

            <Card>
              {getConversationMetadataQuery?.isLoading ? (
                <CircularProgress size="sm" />
              ) : (
                <form className="flex">
                  <Stack direction={'column'} spacing={1} width={'100%'}>
                    <Stack direction="row" mb={2}>
                      <FormControl className="flex flex-row space-x-4">
                        <Checkbox
                          disabled={isFormDisabled}
                          checked={state.isAiEnabled}
                          onChange={async (event) => {
                            await handleUpdateMetadata({
                              aiStatus: event.target.checked
                                ? AIStatus.enabled
                                : AIStatus.disabled,
                            });
                          }}
                        />
                        <div className="flex flex-col">
                          <FormLabel>AI Agent Enabled</FormLabel>
                          <Typography level="body-xs">
                            {`When enabled, your agent will answer customer's questions automatically.`}
                          </Typography>
                        </div>
                      </FormControl>
                    </Stack>
                  </Stack>
                </form>
              )}
            </Card>
          </Stack>
        ) : (
          <Alert color="warning" sx={{ m: 2 }}>
            This feature is restricted to Chaindesk premium users
          </Alert>
        )}
      </Box>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const websiteId = ctx.query.website_id as string;
  const token = ctx.query.token as string;
  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
  if (!websiteId || !token) {
    return redirect;
  }
  // const websites = await getConnectedWebsites();
  // if (token === websites[websiteId]?.token) {
  const integration = await prisma.serviceProvider.findUnique({
    where: {
      unique_external_id: {
        type: ServiceProviderType.crisp,
        externalId: websiteId,
      },
    },
    include: {
      agents: {
        include: {
          organization: {
            include: {
              subscriptions: {
                where: {
                  status: {
                    in: ['active', 'trialing'],
                  },
                },
              },
              apiKeys: true,
            },
          },
        },
      },
    },
  });

  return {
    props: {
      isPremium:
        (integration?.agents?.[0]?.organization?.subscriptions?.length || 0) >
        0,
    },
  };
  // }

  return { props: {} };
};
