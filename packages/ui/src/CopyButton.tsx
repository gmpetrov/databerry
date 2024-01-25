import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { IconButton } from '@mui/joy';
import React, { useCallback, useRef, useState } from 'react';

function CopyButton(props: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<NodeJS.Timeout>();

  const handleCopy = useCallback(async () => {
    try {
      clearTimeout(timer.current);
      navigator.clipboard.writeText(props.text).then(() => {
        setCopied(true);
        timer.current = setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
    } catch (err) {}
  }, [props.text]);

  return copied ? (
    <IconButton size="sm" color="neutral" variant="plain">
      <DoneRoundedIcon fontSize={'sm' as any} />
    </IconButton>
  ) : (
    <IconButton size="sm" color="neutral" variant="plain" onClick={handleCopy}>
      <ContentPasteRoundedIcon fontSize={'sm' as any} />
    </IconButton>
  );
}

export default CopyButton;
