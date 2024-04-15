import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ReplyAllRoundedIcon from '@mui/icons-material/ReplyAllRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import TocRoundedIcon from '@mui/icons-material/TocRounded';
import {
  Box,
  Breadcrumbs,
  Divider,
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
import React, { useEffect, useMemo, useRef, useState } from 'react';

import BlablaFormEditor from '@app/components/BlablaFormEditor';
import FormInstallTab from '@app/components/FormInstallTab';
import FormSettingsTab from '@app/components/FormSettingsTab';
import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Layout from '@app/components/Layout';
import useBlablaForm from '@app/hooks/useBlablaForm';

import { RouteNames } from '@chaindesk/lib/types';
import useStateReducer from '@chaindesk/ui/hooks/useStateReducer';

interface FormDashboardProps {}

function FormDashboard(props: FormDashboardProps) {
  const router = useRouter();
  const formId = router.query.formId as string;

  const { query } = useBlablaForm({ id: formId });

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

  if (!formId) {
    return null;
  }

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
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
            sx={{
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
              Editor
            </Tab>
            <Tab indicatorInset value={'settings'}>
              <ListItemDecorator>
                <SettingsIcon />
              </ListItemDecorator>
              Settings
            </Tab>
            <Tab indicatorInset value={'submissions'}>
              <ListItemDecorator>
                <TocRoundedIcon />
              </ListItemDecorator>
              Submissions
            </Tab>
            <Tab indicatorInset value={'install'}>
              <ListItemDecorator>
                <ReplyAllRoundedIcon sx={{ transform: 'scale(-1, 1)' }} />
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
            <BlablaFormEditor formId={formId} />
          </TabPanel>

          <TabPanel value="submissions">
            {formId && <FormSubmissionsTab formId={formId} />}
          </TabPanel>

          <TabPanel value="settings">
            {formId && <FormSettingsTab formId={formId} />}
          </TabPanel>

          <TabPanel value="install">
            {formId && <FormInstallTab formId={formId} />}
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

// export const getServerSideProps = withAuth(
//   async (ctx: GetServerSidePropsContext) => {
//     return {
//       props: {
//         product: getProductFromHostname(ctx?.req?.headers?.host),
//       },
//     };
//   }
// );
