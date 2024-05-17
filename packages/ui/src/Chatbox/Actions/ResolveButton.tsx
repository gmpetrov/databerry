import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, Chip, CircularProgress, ExtendButton } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useConfetti from '@chaindesk/ui/hooks/useConfetti';

import i18n from '@chaindesk/lib/locales/i18next';
import type { ConversationStatus } from '@chaindesk/prisma';
import { API_URL } from '@chaindesk/ui/embeds/chat-bubble';
import { ChatContext } from '@chaindesk/ui/hooks/useChat';

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

const ResolveButton = ({ sx }: { sx?: SxProps }) => {
  const {
    conversationId,
    conversationStatus,
    refreshConversation,
    createNewConversation,
  } = useContext(ChatContext);

  const [pending, setPending] = useState(false);
  const { t } = useTranslation('', { i18n });
  const triggerConfetti = useConfetti({
    zIndex: 10000000000,
  });
  const handleUpdateStatus = async (status: ConversationStatus) => {
    try {
      setPending(true);
      const response = await updateConversationStatus(conversationId, status);
      await refreshConversation();

      if (response.ok) {
        if (status === 'RESOLVED') {
          // createNewConversation();
          triggerConfetti();
        } else {
        }
      }
    } catch (e) {
    } finally {
      setPending(false);
    }
  };

  return conversationStatus !== 'RESOLVED' ? (
    <Button
      size="sm"
      variant="outlined"
      // @ts-ignore
      color={conversationStatus === 'RESOLVED' ? 'danger' : 'success'}
      startDecorator={
        pending ? (
          <CircularProgress />
        ) : // @ts-ignore
        conversationStatus !== 'RESOLVED' ? (
          <CheckCircleIcon />
        ) : (
          <CancelRoundedIcon />
        )
      }
      sx={{ whiteSpace: 'nowrap', ...sx }}
      onClick={
        // @ts-ignore
        conversationStatus !== 'RESOLVED'
          ? () => handleUpdateStatus('RESOLVED')
          : () => handleUpdateStatus('UNRESOLVED')
      }
    >
      {/* @ts-ignore */}
      {conversationStatus === 'RESOLVED' && 'Mark as Unresolved'}
      {/* @ts-ignore */}
      {conversationStatus !== 'RESOLVED' && t('chatbubble:actions:resolve')}
    </Button>
  ) : null;
};

export default ResolveButton;
