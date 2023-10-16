import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Chip, CircularProgress } from '@mui/joy';
import { memo, useState } from 'react';

import {
  ConversationStatus,
  ConversationStatusUnion,
} from '@chaindesk/lib/types/dtos';

import { API_URL } from './ChatBubble';

const ResolveButton = ({
  conversationId,
  conversationStatus,
  createNewConversation,
}: {
  conversationId: string;
  conversationStatus: ConversationStatusUnion;
  createNewConversation(): void;
}) => {
  const [pending, setPending] = useState(false);
  const [isResolved, setResolved] = useState(false);
  const handleResolve = async () => {
    try {
      setPending(true);
      const response = await fetch(
        `${API_URL}/api/conversations/${conversationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: ConversationStatus.RESOLVED,
          }),
        }
      );
      createNewConversation();
      if (response.ok) {
        setResolved(true);
      }
    } catch (e) {
    } finally {
      setPending(false);
    }
  };
  if (conversationStatus === ConversationStatus.RESOLVED || isResolved) {
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
      sx={{ mr: 'auto' }}
      onClick={handleResolve}
    >
      Mark As Resolved
    </Button>
  );
};

export default ResolveButton;
