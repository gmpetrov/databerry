import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Alert from '@mui/joy/Alert';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import { blake3 } from 'hash-wasm';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getServerSession, Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import superjson from 'superjson';

import Logo from '@app/components/Logo';
import useStateReducer from '@app/hooks/useStateReducer';

import createIntegrationId from '@chaindesk/lib/create-integration-id';
import { getConnectedWebsites } from '@chaindesk/lib/crisp';
import { withAuth } from '@chaindesk/lib/withAuth';
import {
  Agent,
  IntegrationType,
  ServiceProviderType,
  Subscription,
} from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

export default function CrispConfig(props: { agent: Agent }) {
  const session = useSession();
  const router = useRouter();

  const [state, setState] = useStateReducer({
    showSuccessAlert: false,
    isLoading: false,
    apiKey: '',
    error: '',
    currentAgent: props?.agent as Agent | undefined,
    agents: [] as Agent[],
  });

  const organization = session?.data?.organization;

  useEffect(() => {
    (async () => {
      {
        if (organization) {
          const apiKeys = await axios.get('/api/accounts/api-keys');
          const { data } = await axios.get('/api/agents');

          const apiKey = apiKeys.data[0]?.key;

          setState({
            agents: data,
            apiKey,
          });
        }
      }
    })();
  }, [organization]);

  const sendConfig = async (e: any) => {
    e.stopPropagation();
    try {
      setState({
        isLoading: true,
        error: '',
      });

      var _urlParams = new URLSearchParams(window.location.search);

      fetch(
        window.location.origin +
          `/api/integrations/${router.query.name}/config`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: state.currentAgent?.id,
            siteurl: router.query.siteurl,
            integrationType: ServiceProviderType.website,
          }),
        }
      ).then(() => {
        setState({
          showSuccessAlert: true,
        });

        if (router.query.callback) {
          const url = new URL(router.query.callback! as string);

          url.searchParams.append('agentId', state.currentAgent?.id!);

          router.push(url.toString());
        }
      });
    } catch (error) {
      console.log(error);
      setState({
        error: JSON.stringify(error),
      });
    } finally {
      setState({
        isLoading: false,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Chaindesk - LLMs automation without code</title>
        <meta
          name="description"
          content="ChatGPT Bot trained on your data integrated on wordpress"
        />
      </Head>
      {/* <Header /> */}
      <Box className="flex flex-col items-center justify-center w-screen h-screen p-4 overflow-y-auto bg-black">
        <Stack className="w-full max-w-sm mx-auto" gap={2}>
          {state.error && <Alert color="danger">{state.error}</Alert>}

          {state.showSuccessAlert && (
            <Alert color="success">
              Settings saved! You can now close this window.
            </Alert>
          )}

          <Card variant="outlined">
            <Logo className="w-20 mx-auto mb-5" />
            <form className="flex flex-col">
              <Stack spacing={2}>
                {!!state.apiKey && (
                  <FormControl>
                    <FormLabel>
                      Agent to connect to {router.query.name}
                    </FormLabel>
                    <Select
                      placeholder="Choose an Agent"
                      defaultValue={props?.agent?.id}
                      onChange={(_, value) => {
                        const agent = state.agents?.find(
                          (one) => one.id === value
                        );

                        if (agent) {
                          setState({
                            currentAgent: agent,
                          });
                        }
                      }}
                    >
                      {state.agents?.map((agent) => (
                        <Option key={agent.id} value={agent.id}>
                          {agent.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>

              {/* {!currentAgent && (
                <Button
                  loading={isFetchAgentsLoading}
                  className="ml-auto"
                  size="md"
                  onClick={() => handleFetchAgents(inputValue)}
                >
                  Continue
                </Button>
              )} */}
              {state.currentAgent && (
                <>
                  <Divider sx={{ my: 4 }} />

                  <Stack direction={'row'} spacing={1} ml="auto">
                    <Button
                      loading={state.isLoading}
                      size="md"
                      onClick={sendConfig}
                    >
                      Save Settings
                    </Button>
                  </Stack>
                </>
              )}
            </form>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const siteurl = ctx.query.siteurl as string;
  const agentId = ctx.query.agentId as string;
  const name = ctx.query.name as string;
  const session = (ctx as any).req.session as Session;

  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };

  if (!siteurl) {
    return redirect;
  }

  let integration = null;

  if (agentId) {
    integration = await prisma.serviceProvider.findUnique({
      where: {
        unique_external_id: {
          type: name as ServiceProviderType,
          externalId: await createIntegrationId({
            organizationId: session?.organization?.id,
            siteurl,
          }),
        },
      },
      include: {
        agents: true,
      },
    });
  }

  return {
    props: {
      agent: integration
        ? superjson.serialize(integration?.agents?.[0]).json
        : null,
    },
  };
}) as any;
