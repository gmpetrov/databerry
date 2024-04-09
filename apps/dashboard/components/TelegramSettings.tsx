import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import React from 'react';

import useModal from '@app/hooks/useModal';
import useServiceProviders from '@app/hooks/useServiceProviders';

import { IntegrationSettingsMap } from '@chaindesk/integrations/import.browser';

import ListServiceProviders from './ListServiceProviders';

type Props = {
  agentId: string;
};

function TelegramSettings({ agentId }: Props) {
  const addBotModal = useModal({ title: 'Telegram' });

  const { query } = useServiceProviders({
    type: 'telegram',
    agentId,
  });

  return (
    <>
      <Stack gap={2}>
        <ListServiceProviders
          type={'telegram'}
          agentId={agentId}
          emptyLabel={'No Teletgram Bot Is Added Yet.'}
          withDelete
        />

        <Button
          startDecorator={<AddCircleRoundedIcon fontSize="md" />}
          onClick={() => addBotModal.open()}
        >
          Add A Telegram Bot
        </Button>
      </Stack>
      <addBotModal.component
        dialogProps={{
          sx: {
            maxWidth: 'sm',
            height: 'auto',
          },
        }}
      >
        <IntegrationSettingsMap.telegram
          agentId={agentId}
          onSubmitSuccess={() => {
            addBotModal.close();
            query.mutate();
          }}
        />
      </addBotModal.component>
    </>
  );
}

export default TelegramSettings;
