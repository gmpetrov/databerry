import { Box, Divider, Typography } from '@mui/joy';
import { GetServerSidePropsContext } from 'next/types';
import { ReactElement } from 'react';
import * as React from 'react';

import ChatBox from '@app/components/ChatBox';
import Layout from '@app/components/Layout';
import useChat from '@app/hooks/useChat';

export default function DatasourcesPage() {
  const agentId = 'clh9ldhip0000e9ogeunjdqhd';
  const { history, handleChatSubmit } = useChat({
    endpoint: `/api/agents/${agentId}/query`,
  });

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        px: {
          xs: 2,
          md: 6,
        },
        pt: {},
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        gap: 1,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          my: 1,
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography level="h1" fontSize="xl4">
          Taskade - Demo
        </Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxHeight: '100%',
        }}
      >
        <ChatBox messages={history} onSubmit={handleChatSubmit} />
      </Box>
    </Box>
  );
}

DatasourcesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {},
  };
};
