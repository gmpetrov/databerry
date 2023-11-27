import { Box, Typography } from '@mui/joy';

import ColorSchemeToggle from './Layout/ColorSchemeToggle';
import Header from './Layout/Header';
import Logo from './Logo';

export default function TopBar() {
  return (
    <Header>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Logo className="w-10" />
        <Typography component="h1" fontWeight="xl">
          Chaindesk
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        <ColorSchemeToggle />
      </Box>
    </Header>
  );
}
