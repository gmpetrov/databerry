import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/joy/Alert';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import React from 'react';
import useSWR from 'swr';

import useModal from '@app/hooks/useModal';
import { getServiceProviders } from '@app/pages/api/service-providers';

import { IntegrationSettingsMap } from '@chaindesk/integrations/import.browser';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { Prisma } from '@chaindesk/prisma';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

type Props = {
  agentId: string;
};

function ZendeskSettings({ agentId }: Props) {
  const zendeskModal = useModal();
  const [state, setState] = useStateReducer({
    isUpdateLoading: false,
    isDeleteLoading: false,
  });

  const getIntegrations = useSWR<
    Prisma.PromiseReturnType<typeof getServiceProviders>
  >(`/api/service-providers?type=zendesk&agentId=${agentId}`, fetcher);

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

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Alert
          color="neutral"
          variant="soft"
          sx={{ alignItems: 'start' }}
          startDecorator={<InfoIcon fontSize="md" />}
          size="sm"
        >
          The Zendesk integration works in combination with the ChatBubble,
          iFrame and Standalone WebPage integrations.
        </Alert>
        <Alert
          color="neutral"
          variant="soft"
          sx={{ alignItems: 'start' }}
          startDecorator={<InfoIcon fontSize="md" />}
          size="sm"
        >
          Each times a visitor request a human operator, a ticket is created in
          Zendesk with the email of the visitor.
        </Alert>
        <Alert
          color="neutral"
          variant="soft"
          sx={{ alignItems: 'start' }}
          startDecorator={<InfoIcon fontSize="md" />}
          size="sm"
        >
          When the conversation is marked as resovled, the ticket is updated to
          solved in Zendesk.
        </Alert>
      </Stack>

      <Stack>
        <FormLabel>Active connections</FormLabel>
        {getIntegrations?.data?.length ? (
          <List>
            {getIntegrations.data?.map((each, index) => (
              <ListItem key={index}>
                <Typography className="truncate">
                  {each?.name || each?.id}
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
          <Alert variant="outlined">Not connected to any Zendesk Account</Alert>
        )}

        <form className="flex flex-col">
          <Stack sx={{ ml: 'auto' }} direction={'row'} gap={1}>
            <Button
              onClick={() => zendeskModal.open()}
              endDecorator={<ArrowForwardRoundedIcon />}
              sx={{ mt: 4, ml: 'auto' }}
              // disabled={!methods.formState.isValid}
            >
              Connect to Zendesk
            </Button>
          </Stack>
        </form>
      </Stack>
      {/* <Stack spacing={2}>
        <SelectServiceProvider
          serviceProviderType="zendesk"
          onChange={(_, value) => {
            console.log('VALUE', value);
            setSelected(value as string);
          }}
        />
        {!selectedId && (
          <Stack>
            <Button
              variant="plain"
              sx={{ ml: 'auto' }}
              onClick={() => {
                zendeskModal.open();
              }}
            >
              Add Account
            </Button>
          </Stack>
        )}
      </Stack> */}

      <zendeskModal.component
        dialogProps={{
          sx: {
            maxWidth: 'sm',
          },
        }}
      >
        <IntegrationSettingsMap.zendesk
          agentId={agentId}
          onSubmitSuccess={() => {
            getIntegrations.mutate();
            zendeskModal.close();
          }}
        />
      </zendeskModal.component>
    </Stack>
  );
}

export default ZendeskSettings;
