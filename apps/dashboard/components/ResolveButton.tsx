import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Chip, CircularProgress } from '@mui/joy';
import { useState } from 'react';

import type { ConversationStatus } from '@chaindesk/prisma';

import { API_URL } from './ChatBubble';

const ResolveButton = ({
  conversationId,
  conversationStatus,
  createNewConversation,
}: {
  conversationId: string;
  conversationStatus: ConversationStatus;
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
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'RESOLVED' as ConversationStatus,
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
      sx={{ mr: 'auto' }}
      onClick={handleResolve}
    >
      Mark As Resolved
    </Button>
  );
};

export default ResolveButton;
