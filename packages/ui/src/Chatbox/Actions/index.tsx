import { Button, Card, ColorPaletteProp } from '@mui/joy';
import Stack from '@mui/joy/Stack';
import React, { useContext } from 'react';

import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';
import { ChatContext } from '@chaindesk/ui/hooks/useChat';

// import { InjectLeadForm, LEAD_FORM_ID } from './LeadForm';
import ResolveButton, { updateConversationStatus } from './ResolveButton';
import RequestHumanButton from './RequestHumanButton';

type Props = {
  withMarkAsResolved?: boolean;
  withHumanRequested?: boolean;
  userActions?: { url: string; label: string }[];
};

function Actions({
  withHumanRequested,
  withMarkAsResolved,
  userActions = [],
}: Props) {
  const {
    conversationId,
    conversationStatus,
    createNewConversation,
    refreshConversation,
  } = useContext(ChatContext);

  const hasActions =
    userActions.length > 0 || withMarkAsResolved || withHumanRequested;

  if (!hasActions) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          // position: 'relative',
          justifyContent: 'center',
          flexWrap: 'wrap',
          mx: 'auto',
          gap: 1,
        }}
      >
        {conversationId && conversationStatus && (
          <>
            {withMarkAsResolved && <ResolveButton />}

            {withHumanRequested && <RequestHumanButton />}
          </>
        )}

        {userActions.map((action, index) => (
          <a key={index} href={action?.url} target="_blank">
            <Button size="sm" variant="outlined" color="neutral">
              {action.label}
            </Button>
          </a>
        ))}
      </Stack>
    </>
  );
}

export default Actions;
