import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Alert, Button, Card, Stack } from '@mui/joy';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

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
