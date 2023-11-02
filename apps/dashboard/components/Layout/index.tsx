import MailRoundedIcon from '@mui/icons-material/MailRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Theme, useColorScheme } from '@mui/joy';
import Box from '@mui/joy/Box';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React from 'react';

import { appUrl } from '@chaindesk/lib/config';

import Logo from '../Logo';
import SEO from '../SEO';

import ColorSchemeToggle from './ColorSchemeToggle';
import Header from './Header';
import Main from './Main';
import Navigation from './Navigation';
import Root from './Root';
import SideDrawer from './SideDrawer';
import SideNav from './SideNav';

type Props = {
  children: React.ReactNode;
  mainSxProps?: SxProps;
};

export default function Layout(props: Props) {
  const router = useRouter();
  const { mode, setMode } = useColorScheme();
  const { data: session, status } = useSession();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [userMenuElement, setUserMenuElement] =
    React.useState<null | HTMLElement>(null);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isMenuOpen = Boolean(userMenuElement);

  const openUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuElement(event.currentTarget);
  };

  const closeUserMenu = () => {
    setUserMenuElement(null);
  };

  return (
    <>
      <SEO
        title="Dashboard | Chaindesk."
        description="Build your own ChatGPT Chat Bot for your business."
        baseUrl={appUrl}
        uri={router.pathname}
      />
      {drawerOpen && (
        <SideDrawer
          onClose={() => setDrawerOpen(false)}
          className={mounted ? mode : ''}
        >
          <Navigation />
        </SideDrawer>
      )}
      <Root
        className={mounted ? mode : ''}
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
            {/* <ColorSchemeToggle /> */}

            {/* <Box
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
            </Box> */}

            {/* <Menu
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
            </Menu> */}
            <ColorSchemeToggle />
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
            backgroundColor: 'background.popup',
            ...props.mainSxProps,
          }}
        >
          {props.children}
        </Main>
      </Root>
    </>
  );
}
