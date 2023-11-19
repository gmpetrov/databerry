import { Box, BoxProps } from '@mui/joy';

export default function SideNav(props: BoxProps) {
  return (
    <Box
      component="nav"
      className="Navigation"
      {...props}
      sx={[
        {
          p: 2,
          bgcolor: 'background.surface',
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
          overflowY: 'auto',
          display: {
            xs: 'none',
            sm: 'initial',
          },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}
