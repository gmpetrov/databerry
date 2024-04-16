import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React from 'react';

import { Prettify } from '@chaindesk/lib/type-utilites';
import type { Attachment } from '@chaindesk/prisma';

import { ImageZoom } from '@chaindesk/ui/ImageZoom';

type Props = {
  attachment: Prettify<Omit<Attachment, 'messageId' | 'id' | 'conversationId'>>;
};

function download(url: string, filename: string) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch((e) => {
      console.error(e);
      window.open(url, '_blank');
    });
}

function ChatMessageAttachment({ attachment }: Props) {
  const isImage = attachment?.mimeType?.startsWith('image/');
  const isVideo = attachment?.mimeType?.startsWith('video/');
  const isAudio = attachment?.mimeType?.startsWith('audio/');
  const isDownloadableFile = !isImage && !isVideo && !isAudio;

  return (
    <React.Fragment>
      {isImage && (
        <Box
          component={ImageZoom}
          src={attachment.url}
          alt={attachment.name}
          sx={{
            borderRadius: 'xl',
            maxWidth: '100%',
          }}
          options={{
            // margin: 200,
            background: '#000',
          }}
        />
      )}
      {isVideo && (
        <Box
          controls
          component="video"
          src={attachment.url}
          sx={{
            borderRadius: 'xl',
            maxWidth: '100%',
          }}
        />
      )}
      {isAudio && (
        <Box
          controls
          component="audio"
          src={attachment.url}
          sx={{
            maxWidth: '100%',
          }}
        />
      )}
      {isDownloadableFile && (
        <Chip
          color="neutral"
          variant="soft"
          onClick={() => download(attachment.url, attachment.name)}
          size="lg"
          startDecorator={<AttachFileRoundedIcon />}
          sx={{}}
        >
          <Stack gap={1} direction="row" sx={{ alignItems: 'end' }}>
            <Typography>{attachment.name}</Typography>
            <Typography level="body-xs">
              {`${(attachment.size / 100000).toFixed(2)}MB`}
            </Typography>
          </Stack>
        </Chip>
      )}
    </React.Fragment>
  );
}

export default ChatMessageAttachment;
