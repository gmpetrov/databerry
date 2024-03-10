import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

import ChatBoxFrame from '@app/components/ChatBoxFrame';
import ChatBoxLayout from '@app/components/ChatboxNavBarLayout';
import WidgetThemeProvider from '@app/components/WidgetThemeProvider';

function App() {
  const router = useRouter();
  const agentId = router.query.agentId as string;

  const Layout = (props: any) => {
    return React.createElement(ChatBoxLayout, {
      ...props,
      agentId,
    });
  };

  return (
    <Stack sx={{ width: '100dvw', height: '100dvh', maxWidth: '100%' }}>
      <ChatBoxFrame agentId={agentId} layout={Layout} />
    </Stack>
  );
}

App.getLayout = function getLayout(page: ReactElement) {
  return <WidgetThemeProvider>{page}</WidgetThemeProvider>;
};

export default App;
