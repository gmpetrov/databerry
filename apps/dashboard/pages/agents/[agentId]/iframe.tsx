import Stack from '@mui/joy/Stack';
import { useRouter } from 'next/router';
import React, { ReactElement } from 'react';

import ChatBoxLoader from '@chaindesk/ui/ChatBoxLoader';
import ChatBoxLayout from '@chaindesk/ui/ChatboxNavBarLayout';
import WidgetThemeProvider from '@chaindesk/ui/themes/embeds-provider';

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
      <ChatBoxLoader agentId={agentId} layout={Layout} />
    </Stack>
  );
}

App.getLayout = function getLayout(page: ReactElement) {
  return <WidgetThemeProvider prefix="iframe">{page}</WidgetThemeProvider>;
};

export default App;
