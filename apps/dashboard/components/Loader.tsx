import {
  CircularProgress,
  CircularProgressSlotsAndSlotProps,
  Stack,
  StackProps,
} from '@mui/joy';
import React from 'react';

type Props = {
  rootProps?: StackProps;
  circularProgressProps?: CircularProgressSlotsAndSlotProps;
};

function Loader({ circularProgressProps, rootProps }: Props) {
  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        ...rootProps?.style,
      }}
      {...rootProps}
    >
      <CircularProgress size="sm" {...circularProgressProps} />
    </Stack>
  );
}

export default Loader;
