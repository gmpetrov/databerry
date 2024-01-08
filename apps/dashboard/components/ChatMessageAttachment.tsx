import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import React from 'react';

import { Attachment } from '@chaindesk/prisma';

import { ImageZoom } from './ImageZoom';

type Props = {
  attachment: Attachment;
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
    .catch(console.error);
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
          component="video"
          src={attachment.url}
          controls
          sx={{
            borderRadius: 'xl',
            maxWidth: '100%',
          }}
        />
      )}
      {isAudio && (
        <Box
          component="audio"
          src={attachment.url}
          controls
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
          sx={{
            maxWidth: '100%',
          }}
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
