// we can't whitelist all the urls for next/image
/* eslint-disable @next/next/no-img-element */
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Link, Typography } from '@mui/joy';
import { useState } from 'react';

import usePageMetadata from '@app/hooks/usePageMetadata';

function LinkPreviewer({ href }: { href: string }) {
  const meta = usePageMetadata(href);
  const [show, setShow] = useState(true);
  const [hover, setHover] = useState(false);

  if (!meta.ogImage || !show) {
    return null;
  }

  return (
    <div
      className="relative flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={href} target="_blank" rel="noopener noreferrer">
        <Box
          sx={(t) => ({
            background: t.vars.palette.background.body,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 'sm',
            maxHeight: 100,
            mt: 2,
            overflow: 'hidden',
            width: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: t.vars.palette.background.tooltip,
            },
            position: 'relative',
          })}
        >
          <Box
            sx={{
              pl: 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography level="title-lg">{meta.ogTitle}</Typography>
            <Typography level="body-sm">{meta.ogDescription}</Typography>
          </Box>
          <Box>
            <img
              src={meta.ogImage}
              alt={`og-image:${href}`}
              style={{ height: '100%' }}
            />
          </Box>
        </Box>
      </Link>

      <IconButton
        size="sm"
        variant="soft"
        onClick={(e) => {
          e.stopPropagation();
          setShow(false);
        }}
        className={`h-1 w-1 rounded-full m-1 ${
          hover ? 'visible' : 'invisible'
        }`}
      >
        <CloseIcon fontSize="sm" />
      </IconButton>
    </div>
  );
}

export default LinkPreviewer;
