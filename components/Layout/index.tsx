import MailRoundedIcon from '@mui/icons-material/MailRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { Avatar, Chip, Divider, IconButton, Menu, MenuItem } from '@mui/joy';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

import Logo from '../Logo';

import ColorSchemeToggle from './ColorSchemeToggle';
import Header from './Header';
import Main from './Main';
import Navigation from './Navigation';
import Root from './Root';
import SideDrawer from './SideDrawer';
import SideNav from './SideNav';

type Props = {
  children: React.ReactNode;
};

export default function Layout(props: Props) {
  const { data: session, status } = useSession();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [userMenuElement, setUserMenuElement] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(userMenuElement);

  const openUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuElement(event.currentTarget);
  };

  const closeUserMenu = () => {
    setUserMenuElement(null);
  };

  return (
    <>
      {drawerOpen && (
        <SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </SideDrawer>
      )}
      <Root
        sx={{
          ...(drawerOpen && {
            height: '100vh',
            overflow: 'hidden',
          }),
          maxHeight: '100vh',
        }}
      >
        <Header>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <IconButton
              variant="outlined"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {/* <IconButton
              size="sm"
              variant="solid"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <MailRoundedIcon />
            </IconButton> */}
            <Logo className="w-10" />
            <Typography component="h1" fontWeight="xl">
              Chaindesk
            </Typography>

            {session?.user?.isPremium && (
              <Chip color="warning" variant="soft" size="sm">
                premium
              </Chip>
            )}
          </Box>
          {/* <Input
            size="sm"
            placeholder="Search anything…"
            startDecorator={<SearchRoundedIcon color="primary" />}
            endDecorator={
              <IconButton variant="outlined" size="sm" color="neutral">
                <Typography
                  fontWeight="lg"
                  fontSize="sm"
                  textColor="text.tertiary"
                >
                  /
                </Typography>
              </IconButton>
            }
            sx={{
              flexBasis: '500px',
              display: {
                xs: 'none',
                sm: 'flex',
              },
            }}
          /> */}
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
            {/* <IconButton
              size="sm"
              variant="outlined"
              color="primary"
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <SearchRoundedIcon />
            </IconButton> */}
            {/* <IconButton
              size="sm"
              variant="outlined"
              color="primary"
              component="a"
              href="/blog/first-look-at-joy/"
            >
              <BookRoundedIcon />
            </IconButton> */}

            {/* <Menu
              id="app-selector"
              control={
                <IconButton
                  size="sm"
                  variant="outlined"
                  color="primary"
                  aria-label="Apps"
                >
                  <GridViewRoundedIcon />
                </IconButton>
              }
              menus={[
                {
                  label: 'Email',
                  active: true,
                  href: '/joy-ui/getting-started/templates/email/',
                  'aria-current': 'page',
                },
                {
                  label: 'Team',
                  href: '/joy-ui/getting-started/templates/team/',
                },
                {
                  label: 'Files',
                  href: '/joy-ui/getting-started/templates/files/',
                },
              ]}
            /> */}
            <ColorSchemeToggle />

            <Box
              onClick={openUserMenu as any}
              id="basic-demo-button"
              aria-controls={isMenuOpen ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
            >
              <Avatar
                size="sm"
                src={session?.user?.image!}
                sx={{
                  ':hover': {
                    cursor: 'pointer',
                  },
                }}
              />
            </Box>

            <Menu
              id="basic-menu"
              anchorEl={userMenuElement}
              open={isMenuOpen}
              onClose={closeUserMenu}
              aria-labelledby="basic-demo-button"
              placement="bottom-start"
              sx={(theme) => ({
                zIndex: theme.zIndex.tooltip,
              })}
            >
              <MenuItem>{session?.user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </Menu>
          </Box>
        </Header>
        <SideNav>
          <Navigation />
        </SideNav>

        <Main
          sx={{
            height: '100%',
            maxHeight: '100%',
            overflowY: 'scroll',
          }}
        >
          {props.children}
        </Main>
      </Root>
    </>
  );
}
