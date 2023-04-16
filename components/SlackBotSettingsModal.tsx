import { zodResolver } from '@hookform/resolvers/zod';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Modal,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getAgents } from '@app/pages/api/agents';
import { getSlackIntegrations } from '@app/pages/api/integrations/slack/integrations';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  isOpen: boolean;
  handleCloseModal: () => any;
};

const Schema = z.object({ agentId: z.string().min(1) });

export default function SlackBotSettingsModal(props: Props) {
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isUpdateLoading: false,
    isDeleteLoading: false,
  });
  const router = useRouter();
  const getSlackIntegrationsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getSlackIntegrations>
  >('/api/integrations/slack/integrations', fetcher);

  const getAgentsQuery = useSWR<Prisma.PromiseReturnType<typeof getAgents>>(
    '/api/agents',
    fetcher
  );

  const methods = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const methodsUpdate = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  const onSubmit = (values: z.infer<typeof Schema>) => {
    router.push(
      `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
      }&scope=app_mentions:read,channels:history,groups:history,chat:write,commands,users:read&redirect_uri=${
        process.env.NEXT_PUBLIC_DASHBOARD_URL
      }/api/integrations/slack/auth-callback&state=${JSON.stringify({
        userId: session?.user.id,
        agentId: values.agentId,
      })}`
    ),
      '_blank';
  };

  const handleUpdate = async (values: z.infer<typeof Schema>) => {
    try {
      setState({ isUpdateLoading: true });
      await axios.put(`/api/integrations/slack/integrations`, {
        id: integration?.id,
        agentId: values.agentId,
      });

      getSlackIntegrationsQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({ isUpdateLoading: false });
    }
  };

  const handleDelete = async () => {
    try {
      setState({ isDeleteLoading: true });
      await axios.delete(`/api/integrations/slack/integrations`, {
        data: {
          id: integration?.id,
        },
      });
      getSlackIntegrationsQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({ isDeleteLoading: false });
    }
  };

  const integration = getSlackIntegrationsQuery.data?.[0];

  useEffect(() => {
    if (integration) {
      methodsUpdate.setValue('agentId', integration?.agentId as string, {
        shouldDirty: false,
      });
    }
  }, [integration, methodsUpdate]);

  const isLoading =
    getAgentsQuery.isLoading || getSlackIntegrationsQuery.isLoading;

  return (
    <Modal
      open={props.isOpen}
      onClose={props.handleCloseModal}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <Typography level="h4">Slack Bot</Typography>
        <Typography color="neutral" level="h6">
          Settings
        </Typography>
        <Divider sx={{ my: 2 }}></Divider>

        {isLoading ? (
          <CircularProgress size="sm" sx={{ mx: 'auto', my: 4 }} />
        ) : (
          <>
            {integration ? (
              <form className="flex flex-col">
                <Stack direction={'column'}>
                  <FormControl>
                    <FormLabel>Connected Agent</FormLabel>
                    <Select
                      defaultValue={integration?.agentId}
                      onChange={(_, value) => {
                        methodsUpdate.setValue('agentId', value as string, {
                          shouldValidate: true,
                        });
                      }}
                    >
                      {getAgentsQuery?.data?.map((agent) => (
                        <Option key={agent.id} value={agent.id}>
                          {agent.name}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack sx={{ mt: 4, ml: 'auto' }} direction={'row'} gap={1}>
                  <Button
                    startDecorator={<DeleteRoundedIcon />}
                    color="danger"
                    variant="plain"
                    loading={state.isDeleteLoading}
                    disabled={state.isUpdateLoading}
                    onClick={methodsUpdate.handleSubmit(handleDelete)}
                  >
                    Disconnect
                  </Button>
                  <Button
                    loading={state.isUpdateLoading}
                    disabled={
                      !methodsUpdate.formState.isValid || state.isDeleteLoading
                    }
                    startDecorator={<SaveRoundedIcon />}
                    onClick={methodsUpdate.handleSubmit(handleUpdate)}
                  >
                    Update
                  </Button>
                </Stack>
              </form>
            ) : (
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="flex flex-col"
              >
                <Stack direction={'column'}>
                  <Select
                    placeholder="Agent to connect to Slack"
                    onChange={(_, value) => {
                      methods.setValue('agentId', value as string, {
                        shouldValidate: true,
                      });
                    }}
                  >
                    {getAgentsQuery?.data?.map((agent) => (
                      <Option key={agent.id} value={agent.id}>
                        {agent.name}
                      </Option>
                    ))}
                  </Select>
                </Stack>

                <Button
                  type="submit"
                  endDecorator={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 4, ml: 'auto' }}
                  disabled={!methods.formState.isValid}
                >
                  Connect to Slack
                </Button>
              </form>
            )}
          </>
        )}
      </Card>
    </Modal>
  );
}
