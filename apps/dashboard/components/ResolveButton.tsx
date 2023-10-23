import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Chip, CircularProgress, ExtendButton } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { useState } from 'react';

import useConfetti from '@app/hooks/useConfetti';

import { ConversationStatus } from '@chaindesk/prisma';

import { API_URL } from './ChatBubble';

export const updateConversationStatus = async (
  conversationId: string,
  status: ConversationStatus
) => {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
      }),
    }
  );
  return response;
};

const ResolveButton = ({
  conversationId,
  conversationStatus,
  createNewConversation,
  sx,
}: {
  conversationId: string;
  conversationStatus: ConversationStatus;
  createNewConversation(): void;
  sx?: SxProps;
}) => {
  const [pending, setPending] = useState(false);
  const [isResolved, setResolved] = useState(false);
  const triggerConfetti = useConfetti({
    zIndex: 10000000000,
  });
  const handleResolve = async () => {
    try {
      setPending(true);
      const response = await updateConversationStatus(
        conversationId,
        ConversationStatus.RESOLVED
      );
      if (response.ok) {
        setResolved(true);
        createNewConversation();
        triggerConfetti();
      }
    } catch (e) {
    } finally {
      setPending(false);
    }
  };
  if (conversationStatus === 'RESOLVED' || isResolved) {
    return (
      <Chip variant="soft" size="md" color="success">
        Resolved !
      </Chip>
    );
  }
  return (
    <Button
      size="sm"
      variant="plain"
      color="neutral"
      startDecorator={pending ? <CircularProgress /> : <CheckCircleIcon />}
      sx={{ whiteSpace: 'nowrap', ...sx }}
      onClick={handleResolve}
    >
      Mark As Resolved
    </Button>
  );
};

export default ResolveButton;
