import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import MenuIcon from '@mui/icons-material/Menu';
import TwitterIcon from '@mui/icons-material/Twitter';
import {
  Alert,
  Button,
  Chip,
  IconButton,
  Stack,
  Theme,
  useColorScheme,
} from '@mui/joy';
import Box from '@mui/joy/Box';
import { SxProps } from '@mui/joy/styles/types';
import Typography from '@mui/joy/Typography';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import React from 'react';

import useModal from '@app/hooks/useModal';

import { appUrl } from '@chaindesk/lib/config';
import DarkModeToggle from '@chaindesk/ui/DarkModeToggle';

import Logo from '../Logo';
import SEO from '../SEO';

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

  const shareFeedbackModal = useModal();

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

  // const showPromoBanner =
  //   status !== 'loading' && !session?.organization?.isPremium;
  const showPromoBanner = false;
  const promoBannerHeight = showPromoBanner ? 45.5 : 0;

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
          <Box sx={{ height: '100%', overflowY: 'auto' }}>
            <Navigation />
          </Box>
        </SideDrawer>
      )}
      {showPromoBanner && (
        <Stack
          sx={{
            width: '100vw',
            maxWidth: '100%',
            p: 0,
          }}
        >
          <Alert
            size="sm"
            variant="soft"
            color="warning"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
              borderRadius: 0,
            }}
            invertedColors
          >
            <Stack direction="row" gap={1}>
              <Chip color="danger">Ending Soon!</Chip>
              <Typography>
                Share on social and get 30% off on your subscription!
              </Typography>
            </Stack>

            <Stack direction="row" gap={1}>
              <a
                target="_blank"
                className="w-full"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`This is a game changer! 
          
          Chaindesk has transformed the way we handle customer queries with its next-gen AI native solution. Definitely a game-changer!
          
          Find out more: https://www.chaindesk.ai`)}`}
              >
                <Button
                  color="neutral"
                  // variant="outlined"
                  startDecorator={<TwitterIcon />}
                  size="sm"
                >
                  Share
                </Button>
              </a>
              <a
                target="_blank"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.chaindesk.ai`}
                className="w-full"
              >
                <Button
                  color="neutral"
                  // variant="outlined"
                  startDecorator={<LinkedInIcon />}
                  size="sm"
                >
                  Share
                </Button>
              </a>
            </Stack>
          </Alert>
        </Stack>
      )}

      <Root
        className={mounted ? mode : ''}
        sx={{
          ...(drawerOpen && {
            height: `calc(100dvh - ${promoBannerHeight}px)`,
            overflow: 'hidden',
          }),
          maxHeight: `calc(100dvh - ${promoBannerHeight}px)`,
          minHeight: `calc(100dvh - ${promoBannerHeight}px)`,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <Navigation />

        <Main
          sx={{
            position: 'relative',
            minHeight: `calc(100dvh - ${promoBannerHeight}px)`,
            maxHeight: `calc(100dvh - ${promoBannerHeight}px)`,
            height: '100dvh',
            width: '100%',

            ...props.mainSxProps,
          }}
        >
          {props.children}
        </Main>
        <shareFeedbackModal.component
          dialogProps={{
            sx: {
              height: '100%',
              flex: 1,
            },
          }}
        >
          <Box
            component={'iframe'}
            src={'https://app.chaindesk.ai/forms/clqz46y9u003e8ipv0lvfcnsg'}
            frameBorder="0"
            sx={{
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              borderRadius: 'xl',
              overflow: 'hidden',
            }}
          ></Box>
        </shareFeedbackModal.component>
      </Root>
    </>
  );
}
