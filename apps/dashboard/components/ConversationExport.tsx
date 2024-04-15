import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';
import { Button } from '@mui/joy';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import {
  ConversationChannel,
  ConversationPriority,
  MessageEval,
} from '@chaindesk/prisma';

interface Props {
  channel?: ConversationChannel;
  priority?: ConversationPriority;
  agentId?: string;
  assigneeId?: string;
  messageEval?: MessageEval;
}

export function ConversationExport({
  channel,
  priority,
  messageEval,
  agentId,
  assigneeId,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const exportConversations = async () => {
    try {
      const { success: validChannel } = z
        .nativeEnum(ConversationChannel)
        .safeParse(channel);
      const { success: validEval } = z
        .nativeEnum(MessageEval)
        .safeParse(messageEval);
      const { success: validPriority } = z
        .nativeEnum(MessageEval)
        .safeParse(priority);

      const { success: validAgentId } = z.string().min(3).safeParse(agentId);
      const { success: validAssigneeId } = z
        .string()
        .min(3)
        .safeParse(assigneeId);

      setIsLoading(true);
      const { data } = await toast.promise(
        axios.post(
          '/api/conversations/export',
          {
            ...(validChannel ? { channel } : {}),
            ...(validPriority ? { priority } : {}),
            ...(validAgentId ? { agentId } : {}),
            ...(validAssigneeId ? { assigneeId } : {}),
            ...(validEval ? { messageEval } : {}),
          },
          {
            responseType: 'blob',
          }
        ),
        {
          loading: 'Exporting...',
          error: 'something went wrong with your export.',
          success: 'Export finished!',
        }
      );

      saveAs(data, 'conversations.zip');
    } catch (e) {
      console.error('Failed to export', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="neutral"
      loading={isLoading}
      onClick={exportConversations}
      startDecorator={<DownloadForOfflineRoundedIcon fontSize="lg" />}
      size="md"
    >
      Export Conversations
    </Button>
  );
}
