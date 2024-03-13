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
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import superjson from 'superjson';

import Logo from '@app/components/Logo';

import { appUrl } from '@chaindesk/lib/config';
import { getConnectedWebsites } from '@chaindesk/lib/crisp';
import { Agent, ServiceProviderType, Subscription } from '@chaindesk/prisma';
import { prisma } from '@chaindesk/prisma/client';

export default function CrispConfig(props: { agent: Agent }) {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [isApiKeyValid, setIsApiKeyValid] = useState(!!props.agent);
  const [isFetchAgentsLoading, setIsFetchAgentsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(
    (props as any)?.agent?.organization?.apiKeys?.[0]?.key || ''
  );
  const [submitError, setSubmitError] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | undefined>(
    props.agent
  );
  const subscription = (props?.agent as any)?.organization
    ?.subscriptions?.[0] as Subscription;
  const [isPremium, setIsPremium] = useState(
    subscription?.plan && subscription?.plan !== 'level_0'
  );
  const [apiKey, setApiKey] = useState('');
  const organization = session?.data?.organization;

  useEffect(() => {
    (async () => {
      {
        if (organization) {
          const apiKeys = await axios.get('/api/accounts/api-keys');
          const { data } = await axios.get('/api/agents');

          const apiKey = apiKeys.data[0]?.key;
          setIsPremium(organization?.isPremium);
          setAgents(data);
          setApiKey(apiKey);
          setIsApiKeyValid(!!apiKey);
        }
      }
    })();
  }, [organization]);

  const handleFetchAgents = async (apiKey: string) => {
    try {
      setIsFetchAgentsLoading(true);
      const { data } = await axios.get('/api/agents', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const fetchedUser = await axios.get('/api/me', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      setAgents(data);
      setIsApiKeyValid(true);
      const plan = fetchedUser?.data?.subscriptions?.[0]?.plan;
      const premium = plan && plan !== 'level_0';
      setIsPremium(premium);

      console.log('agents', agents);
    } catch (err) {
      console.log('err', err);
      setSubmitError(JSON.stringify(err));
    } finally {
      setIsFetchAgentsLoading(false);
    }
  };

  const sendConfig = async (e: any) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      setSubmitError('');

      var _urlParams = new URLSearchParams(window.location.search);

      fetch(window.location.origin + '/api/integrations/crisp/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_id: _urlParams.get('website_id'),
          token: _urlParams.get('token'),
          apiKey: apiKey || inputValue,
          agentId: currentAgent?.id,
        }),
      }).then(() => {
        console.log('worked');
        setShowSuccessAlert(true);
      });
    } catch (error) {
      console.log(error);
      setSubmitError(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const apiKey = (props as any)?.agent?.organization?.apiKeys?.[0]?.key;

    console.log('apiKey', apiKey);

    if (apiKey) {
      handleFetchAgents(apiKey);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Chaindesk - LLMs automation without code</title>
        <meta
          name="description"
          content="Most bookkeeping software is accurate, but hard to use. We make the opposite trade-off, and hope you don’t get audited."
        />
      </Head>
      {/* <Header /> */}
      <Box className="flex flex-col items-center justify-center w-screen h-screen p-4 overflow-y-auto bg-black">
        <Stack className="w-full max-w-sm mx-auto" gap={2}>
          {submitError && <Alert color="danger">Ooops! Invalid Api Key</Alert>}

          {showSuccessAlert && (
            <Alert color="success">
              Settings saved! You can now close this window.
            </Alert>
          )}

          <Card variant="outlined">
            <Logo className="w-20 mx-auto mb-5" />
            <form className="flex flex-col">
              <Stack spacing={2}>
                {!organization && (
                  <FormControl>
                    <FormLabel>Chaindesk API Key</FormLabel>
                    <Alert variant="outlined" sx={{ mb: 2 }}>
                      <Stack>
                        You can find your API Key in your Chaindesk{' '}
                        <Link
                          href={`${appUrl}/settings/api-keys`}
                          target="_blank"
                        >
                          <Typography color="primary">
                            account settings.
                          </Typography>
                        </Link>
                      </Stack>
                    </Alert>
                    <Input
                      value={inputValue}
                      placeholder="Your Chaindesk API Key here"
                      onChange={(e) => setInputValue(e.currentTarget.value)}
                    />
                  </FormControl>
                )}

                {!isPremium && isApiKeyValid && (
                  <Alert color="warning">
                    This is a premium feature. Please upgrade your plan to use
                    the Crisp integration.
                  </Alert>
                )}

                {isPremium && isApiKeyValid && (
                  <FormControl>
                    <FormLabel>Agent to connect to Crisp</FormLabel>
                    <Select
                      placeholder="Choose an Agent"
                      defaultValue={props?.agent?.id}
                      onChange={(_, value) => {
                        const agent = agents?.find((one) => one.id === value);

                        if (agent) {
                          setCurrentAgent(agent);
                        }
                      }}
                    >
                      {agents?.map((agent) => (
                        <Option key={agent.id} value={agent.id}>
                          {agent.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Stack>
              <Divider className="my-8" />

              {!currentAgent && (
                <Button
                  loading={isFetchAgentsLoading}
                  className="ml-auto"
                  size="md"
                  onClick={() => handleFetchAgents(inputValue)}
                >
                  Continue
                </Button>
              )}
              {isPremium && currentAgent && (
                <Stack direction={'row'} spacing={1} ml="auto">
                  <Button
                    size="md"
                    onClick={() => {
                      setAgents([]);
                      setInputValue('');
                      setIsApiKeyValid(false);
                      setCurrentAgent(undefined);
                      setShowSuccessAlert(false);
                    }}
                    variant="plain"
                  >
                    Reset
                  </Button>

                  <Button loading={isLoading} size="md" onClick={sendConfig}>
                    Save Settings
                  </Button>
                </Stack>
              )}
            </form>
          </Card>
        </Stack>
      </Box>
    </>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const websiteId = ctx.query.website_id as string;
  const token = ctx.query.token as string;

  console.log('TOKEN', token);

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
              subscriptions: true,
              apiKeys: true,
            },
          },
        },
      },
    },
  });

  return {
    props: {
      agent: superjson.serialize(integration?.agents?.[0]).json || null,
    },
  };
  // }

  return redirect;
};
