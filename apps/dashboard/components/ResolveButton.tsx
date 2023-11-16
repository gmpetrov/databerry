import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Chip, CircularProgress, ExtendButton } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import useConfetti from '@app/hooks/useConfetti';

import i18n from '@chaindesk/lib/locales/i18next';
import type { ConversationStatus } from '@chaindesk/prisma';

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
  refreshConversation,
  sx,
}: {
  conversationId: string;
  conversationStatus: ConversationStatus;
  createNewConversation(): void;
  refreshConversation(): void;
  sx?: SxProps;
}) => {
  const [pending, setPending] = useState(false);
  const { t } = useTranslation('', { i18n });
  const triggerConfetti = useConfetti({
    zIndex: 10000000000,
  });
  const handleUpdateStatus = async (status: ConversationStatus) => {
    try {
      setPending(true);
      const response = await updateConversationStatus(conversationId, status);
      if (response.ok) {
        if (status === 'RESOLVED') {
          createNewConversation();
          triggerConfetti();
        } else {
          await refreshConversation();
        }
      }
    } catch (e) {
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="plain"
      color={conversationStatus === 'RESOLVED' ? 'danger' : 'success'}
      startDecorator={
        pending ? (
          <CircularProgress />
        ) : conversationStatus !== 'RESOLVED' ? (
          <CheckCircleIcon />
        ) : (
          <CancelRoundedIcon />
        )
      }
      sx={{ whiteSpace: 'nowrap', ...sx }}
      onClick={
        conversationStatus !== 'RESOLVED'
          ? () => handleUpdateStatus('RESOLVED')
          : () => handleUpdateStatus('UNRESOLVED')
      }
    >
      {conversationStatus === 'RESOLVED' && 'Mark as Unresolved'}
      {conversationStatus !== 'RESOLVED' && t('chatbubble:actions:resolve')}
    </Button>
  );
};

export default ResolveButton;
