import { Box, Chip, Stack } from '@mui/joy';
import React from 'react';

const BubblesLoading = () => {
  return (
    <Chip
      size="md"
      sx={{ overflow: 'visible' }}
      slotProps={{
        label: {
          sx: {
            overflow: 'visible',
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems={'center'}
        gap={0.5}
        sx={{ overflow: 'visible' }}
      >
        <Box
          className="animate-[bounce_1s_infinite]"
          sx={(t) => ({
            width: '9px',
            height: '9px',
            background: t.palette.neutral[400],
            borderRadius: '100%',
            opacity: 0.7,
          })}
        ></Box>
        <Box
          className="animate-[bounce_1s_infinite_-100ms]"
          sx={(t) => ({
            width: '9px',
            height: '9px',
            background: t.palette.neutral[400],
            borderRadius: '100%',
            opacity: 0.7,
          })}
        ></Box>
        <Box
          className="animate-[bounce_1s_infinite_-200ms]"
          sx={(t) => ({
            width: '9px',
            height: '9px',
            background: t.palette.neutral[400],
            borderRadius: '100%',
            opacity: 0.7,
          })}
        ></Box>
      </Stack>
    </Chip>
  );
};

export default BubblesLoading;
