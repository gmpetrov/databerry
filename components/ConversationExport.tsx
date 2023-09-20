import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Alert, Button, Card, Stack } from '@mui/joy';
import { User } from '@prisma/client';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { ConversationWithMessages } from '@app/types/dtos';

interface Props {}

export function ConversationExport({}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const exportConversations = async () => {
    try {
      setIsLoading(true);
      const { data } = await toast.promise(
        axios.post(
          '/api/conversations/export',
          {},
          {
            responseType: 'blob',
          }
        ),
        {
          loading: 'Exporting...',
          error: 'Ooop! something went wrong with your exort.',
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
    <Card
      variant="soft"
      color="neutral"
      sx={{ justifyContent: 'center' }}
      size="sm"
    >
      <Stack direction="row">
        <Alert
          variant="plain"
          color="neutral"
          startDecorator={<InfoRoundedIcon />}
        >
          View all Agents conversations across all channels. Evaluate and
          improve answers.
        </Alert>

        <Button
          variant="solid"
          color="primary"
          loading={isLoading}
          sx={{ marginLeft: 'auto' }}
          onClick={exportConversations}
          startDecorator={<DownloadForOfflineRoundedIcon fontSize="lg" />}
          size="sm"
        >
          Export Conversations
        </Button>
      </Stack>
    </Card>
  );
}
