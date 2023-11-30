import { Box, Link, Typography } from '@mui/joy';

import ColorSchemeToggle from './Layout/ColorSchemeToggle';
import Header from './Layout/Header';
import Logo from './Logo';
type Props = {
  href?: string;
};
export default function TopBar(props: Props) {
  return (
    <Header>
      <Link href={props.href}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Logo className="w-10" />
          <Typography component="h1" fontWeight="xl">
            Chaindesk
          </Typography>
        </Box>
      </Link>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        <ColorSchemeToggle />
      </Box>
    </Header>
  );
}
