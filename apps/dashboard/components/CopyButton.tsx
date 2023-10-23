import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import IconButton from '@mui/joy/IconButton';
import React, { useCallback, useState } from 'react';

export default function CopyButton(props: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {}
  }, [props.text]);

  return copied ? (
    <IconButton size="sm" color="neutral" variant="plain">
      <DoneRoundedIcon fontSize={'sm'} />
    </IconButton>
  ) : (
    <IconButton size="sm" color="neutral" variant="plain" onClick={handleCopy}>
      <ContentPasteRoundedIcon fontSize={'sm'} />
    </IconButton>
  );
}
