import { Box, BoxProps, Stack } from '@mui/joy';

export default function Root(props: BoxProps) {
  return (
    <Box
      {...props}
      sx={[...(Array.isArray(props.sx) ? props.sx : [props.sx])]}
    />
  );
}
