import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import TocRoundedIcon from '@mui/icons-material/TocRounded';
import {
  Box,
  Breadcrumbs,
  ListItemDecorator,
  Stack,
  Tab,
  tabClasses,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import EmailInboxSettingsTab from '@app/components/EmailInboxSettingsTab';
import Layout from '@app/components/Layout';
import MailInboxEditorTab from '@app/components/MailInboxEditorTab';
import MailInboxInstallTab from '@app/components/MailInboxInstallTab';
import useBlablaForm from '@app/hooks/useBlablaForm';
import useMailInbox from '@app/hooks/useMailInbox';

import { RouteNames } from '@chaindesk/lib/types';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

interface FormDashboardProps {}

function FormDashboard(props: FormDashboardProps) {
  const router = useRouter();
  const inboxId = router.query.id as string;

  const { query } = useMailInbox({ id: inboxId });

  const [state, setState] = useStateReducer({
    currentAnswer: '',
    isConversationStarted: false,
    isFormCompleted: false,
    isPublishable: false,
    currentAccordionIndex: 0 as number | null,
  });

  useEffect(() => {
    if (router.isReady && typeof window !== 'undefined' && !router.query.tab) {
      handleChangeTab('editor');
    }
  }, [router.query.tab]);

  const handleChangeTab = (tab: string) => {
    router.query.tab = tab;
    router.replace(router);
  };

  if (!inboxId) {
    return null;
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pt: {
          // xs: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // sm: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // md: 3,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        width: '100%',
        gap: 1,
      })}
    >
      <Stack gap={1} sx={{ height: '100%', width: '100%' }}>
        <Breadcrumbs
          size="sm"
          aria-label="breadcrumbs"
          separator={<ChevronRightRoundedIcon />}
          sx={{
            '--Breadcrumbs-gap': '1rem',
            '--Icon-fontSize': '16px',
            fontWeight: 'lg',
            color: 'neutral.400',
            px: 0,
          }}
        >
          <Link href={RouteNames.HOME}>
            <HomeRoundedIcon />
          </Link>
          <Link href={RouteNames.EMAIL_INBOXES}>
            <Typography
              fontSize="inherit"
              color="neutral"
              className="hover:underline"
            >
              Email Inboxes
            </Typography>
          </Link>

          <Typography fontSize="inherit" color="primary">
            {query?.data?.name}
          </Typography>

          {/* <JoyLink
          underline="hover"
          color="neutral"
          fontSize="inherit"
          href="#some-link"
        >
          Datastores
        </JoyLink> */}
          {/* <Typography fontSize="inherit" variant="soft" color="primary">
          Orders
        </Typography> */}
        </Breadcrumbs>

        <Tabs
          aria-label="tabs"
          value={(router.query.tab as string) || 'editor'}
          size="md"
          sx={{
            bgcolor: 'transparent',
            width: '100%',
            height: 'calc(100% - 37px)',
          }}
          onChange={(_, value) => {
            handleChangeTab(value as string);
          }}
        >
          <TabList
            size="sm"
            // sx={{
            //   [`&& .${tabClasses.root}`]: {
            //     flex: 'initial',
            //     bgcolor: 'transparent',
            //     '&:hover': {
            //       bgcolor: 'transparent',
            //     },
            // [`&.${tabClasses.selected}`]: {
            //   color: 'primary.plainColor',
            //   '&::after': {
            //     height: '3px',
            //     borderTopLeftRadius: '3px',
            //     borderTopRightRadius: '3px',
            //     bgcolor: 'primary.500',
            //   },
            // },
            //   },
            // }}

            // sx={{
            //   p: 0.7,
            //   gap: 0.5,
            //   borderRadius: 'xl',
            //   bgcolor: 'background.level1',
            //   [`& .${tabClasses.root}[aria-selected="true"]`]: {
            //     boxShadow: 'sm',
            //     bgcolor: 'background.surface',
            //     '&::after': {
            //       height: '0px',
            //       width: '0px',
            //     },
            //   },
            // }}

            sx={{
              // pt: 2,
              justifyContent: 'start',
              [`&& .${tabClasses.root}`]: {
                flex: 'initial',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'transparent',
                },
                [`&.${tabClasses.selected}`]: {
                  color: 'primary.plainColor',
                  '&::after': {
                    height: '3px',
                    borderTopLeftRadius: '3px',
                    borderTopRightRadius: '3px',
                    bgcolor: 'primary.500',
                  },
                },
              },
            }}
          >
            <Tab indicatorInset value={'editor'}>
              <ListItemDecorator>
                <AutoAwesomeRoundedIcon />
              </ListItemDecorator>
              Email Inbox
            </Tab>
            <Tab indicatorInset value={'settings'}>
              <ListItemDecorator>
                <SettingsIcon />
              </ListItemDecorator>
              Settings
            </Tab>
            <Tab indicatorInset value={'install'}>
              <ListItemDecorator>
                <ForwardToInboxIcon />
              </ListItemDecorator>
              Install
            </Tab>
          </TabList>

          <TabPanel value={'preview'}>Preview</TabPanel>

          <TabPanel
            value={'editor'}
            sx={{
              height: '100%',
            }}
          >
            {inboxId && <MailInboxEditorTab inboxId={inboxId} />}
          </TabPanel>

          <TabPanel value="settings">
            {inboxId && <EmailInboxSettingsTab inboxId={inboxId} />}
          </TabPanel>
          <TabPanel value="install">
            {inboxId && <MailInboxInstallTab inboxId={inboxId} />}
          </TabPanel>
        </Tabs>
      </Stack>
    </Box>
  );
}

export default FormDashboard;

FormDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
