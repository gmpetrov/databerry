import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import IconButton from '@mui/joy/IconButton';
import Tooltip from '@mui/joy/Tooltip';
import React, { ComponentProps, useContext } from 'react';

import { ChatContext } from '@app/hooks/useChat';

type Props = ComponentProps<typeof IconButton> & {};

function NewChatButton(props: Props) {
  const { createNewConversation, history } = useContext(ChatContext);

  if (history.length <= 0) {
    return null;
  }

  return (
    <Tooltip
      title="New Chat"
      variant="solid"
      placement="bottom"
      arrow
      sx={{
        zIndex: 10000000000, // Otherwise no visible with Chatbubble widget
      }}
    >
      <IconButton
        onClick={() => createNewConversation()}
        color="neutral"
        variant="outlined"
        size="sm"
        {...props}
      >
        <MapsUgcRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}

export default NewChatButton;
