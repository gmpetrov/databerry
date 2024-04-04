import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import React from 'react';

type Props = {};

function PoweredBy({}: Props) {
  return (
    <a
      href="https://chaindesk.ai"
      target="_blank"
      style={{
        textDecoration: 'none',
        marginLeft: 'auto',
        marginRight: 'auto',
        // marginBottom: '2px',
      }}
    >
      <Chip variant="outlined" size="sm" color="neutral">
        <Box className="truncate" sx={{ whiteSpace: 'nowrap' }}>
          <Typography level="body-xs" fontSize={'10px'}>
            Powered by{' '}
            <Typography color="primary" fontWeight={'bold'}>
              ⚡️ Chaindesk
            </Typography>
          </Typography>
        </Box>
      </Chip>
    </a>
  );
}

export default PoweredBy;
