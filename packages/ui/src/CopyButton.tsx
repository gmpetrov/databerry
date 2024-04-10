import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { IconButton } from '@mui/joy';
import React, { useCallback, useRef, useState } from 'react';

function CopyButton(props: { text: string; className?: string }) {
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

  return (
    <IconButton
      size="sm"
      color="neutral"
      variant="plain"
      onClick={handleCopy}
      className={props.className}
    >
      {copied ? (
        <DoneRoundedIcon sx={{ fontSize: 'sm' }} />
      ) : (
        <ContentPasteRoundedIcon sx={{ fontSize: 'sm' }} />
      )}
    </IconButton>
  );
}

export default CopyButton;
