import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  List,
  ListItem,
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
import { getSlackIntegrations } from '@app/pages/api/integrations/slack/integrations';
import { fetcher } from '@app/utils/swr-fetcher';

type Props = {
  isOpen: boolean;
  handleCloseModal: () => any;
  agentId: string;
};

const Schema = z.object({ agentId: z.string().min(1) });

export default function SlackSettingsModal(props: Props) {
  const { data: session, status } = useSession();
  const [state, setState] = useStateReducer({
    isUpdateLoading: false,
    isDeleteLoading: false,
  });
  const router = useRouter();
  const getSlackIntegrationsQuery = useSWR<
    Prisma.PromiseReturnType<typeof getSlackIntegrations>
  >(`/api/integrations/slack/integrations/${props.agentId}`, fetcher);

  const onSubmit = () => {
    router.push(
      `https://slack.com/oauth/v2/authorize?client_id=${
        process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
      }&scope=app_mentions:read,channels:history,groups:history,chat:write,commands,users:read&redirect_uri=${
        process.env.NEXT_PUBLIC_DASHBOARD_URL
      }/api/integrations/slack/auth-callback&state=${JSON.stringify({
        userId: session?.user.id,
        agentId: props.agentId,
      })}`
    ),
      '_blank';
  };

  const handleDelete = async (id: string) => {
    try {
      setState({ isDeleteLoading: true });
      await axios.delete(`/api/integrations/slack/integrations`, {
        data: {
          id,
        },
      });
      getSlackIntegrationsQuery.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({ isDeleteLoading: false });
    }
  };

  const isLoading = getSlackIntegrationsQuery.isLoading;

  if (!props.agentId) {
    return null;
  }

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
      <Card variant="outlined" sx={{ width: '100%', maxWidth: 400 }}>
        <Typography level="h4">Slack Bot</Typography>
        <Typography color="neutral" level="h6">
          Settings
        </Typography>
        <Divider sx={{ my: 2 }}></Divider>

        {isLoading ? (
          <CircularProgress size="sm" sx={{ mx: 'auto' }} />
        ) : (
          <>
            <FormLabel>Active connections</FormLabel>
            {getSlackIntegrationsQuery?.data?.length ? (
              <List>
                {getSlackIntegrationsQuery.data?.map((each, index) => (
                  <ListItem key={index}>
                    <Typography className="truncate">
                      {((each as any)?.metadata as any)?.team?.name ||
                        each.integrationId}
                    </Typography>

                    <IconButton
                      sx={{ ml: 2 }}
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(each.id)}
                      disabled={state.isDeleteLoading}
                    >
                      {state.isDeleteLoading ? (
                        <CircularProgress
                          color="neutral"
                          variant="soft"
                          size="sm"
                        />
                      ) : (
                        <CloseRoundedIcon />
                      )}
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert variant="outlined">
                Not connected to any Slack workspace
              </Alert>
            )}

            <form className="flex flex-col">
              <Stack sx={{ ml: 'auto' }} direction={'row'} gap={1}>
                <Button
                  onClick={() => onSubmit()}
                  endDecorator={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 4, ml: 'auto' }}
                  // disabled={!methods.formState.isValid}
                >
                  Connect to Slack
                </Button>
              </Stack>
            </form>
          </>
        )}
      </Card>
    </Modal>
  );
}
