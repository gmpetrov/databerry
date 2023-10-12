import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormLabel,
  IconButton,
  List,
  ListItem,
  Modal,
  Stack,
  Typography,
} from '@mui/joy';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

import useStateReducer from '@app/hooks/useStateReducer';
import { getServiceProviders } from '@app/pages/api/service-providers';

import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';

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
  const getIntegrations = useSWR<
    Prisma.PromiseReturnType<typeof getServiceProviders>
  >(`/api/service-providers?type=slack&agentId=${props.agentId}`, fetcher);

  const onSubmit = async () => {
    const res = await axios.get(
      `/api/integrations/slack/add?agentId=${props.agentId}`
    );

    const url = res?.data?.url as string;

    window.open(url, '_blank');
  };

  const handleDelete = async (id: string) => {
    try {
      setState({ isDeleteLoading: true });

      await axios.delete(`/api/service-providers/${id}`);

      getIntegrations.mutate();
    } catch (err) {
      console.log(err);
    } finally {
      setState({ isDeleteLoading: false });
    }
  };

  const isLoading = getIntegrations.isLoading;

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
        <Typography color="neutral" level="title-md">
          Settings
        </Typography>
        <Divider sx={{ my: 2 }}></Divider>

        {isLoading ? (
          <CircularProgress size="sm" sx={{ mx: 'auto' }} />
        ) : (
          <>
            <FormLabel>Active connections</FormLabel>
            {getIntegrations?.data?.length ? (
              <List>
                {getIntegrations.data?.map((each, index) => (
                  <ListItem key={index}>
                    <Typography className="truncate">
                      {((each as any)?.config as any)?.team?.name ||
                        each.externalId}
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
