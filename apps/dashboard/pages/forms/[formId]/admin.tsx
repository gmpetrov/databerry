import { Box, Tab, tabClasses, TabList, TabPanel, Tabs } from '@mui/joy';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import BlablaFormEditor from '@app/components/BlablaFormEditor';
import FormSettingsTab from '@app/components/FormSettingsTab';
import FormSubmissionsTab from '@app/components/FormSubmissionsTab';
import Layout from '@app/components/Layout';
import useStateReducer from '@app/hooks/useStateReducer';

interface FormDashboardProps {}

function FormDashboard(props: FormDashboardProps) {
  const router = useRouter();
  const formId = router.query.formId as string;

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
        px: {
          xs: 2,
          md: 6,
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
        width: '100%',
        height: '100%',
        gap: 1,
      })}
    >
      <Tabs
        aria-label="tabs"
        value={(router.query.tab as string) || 'editor'}
        size="md"
        sx={{
          bgcolor: 'transparent',
          width: '100%',
          height: '100%',
        }}
        onChange={(_, value) => {
          handleChangeTab(value as string);
        }}
      >
        <TabList
          size="sm"
          disableUnderline
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

          sx={{
            p: 0.7,
            gap: 0.5,
            borderRadius: 'xl',
            bgcolor: 'background.level1',
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              boxShadow: 'sm',
              bgcolor: 'background.surface',
              '&::after': {
                height: '0px',
                width: '0px',
              },
            },
          }}
        >
          <Tab indicatorInset value={'editor'}>
            Editor
          </Tab>
          <Tab indicatorInset value={'settings'}>
            Settings
          </Tab>
          <Tab indicatorInset value={'submissions'}>
            Submissions
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
      </Tabs>
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
