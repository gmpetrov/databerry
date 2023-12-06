import React, { ReactElement } from 'react';

import ChatBoxFrame from '@app/components/ChatBoxFrame';
import IFrameThemeProvider from '@app/components/IFrameThemeProvider';

function App() {
  return <ChatBoxFrame />;
}

App.getLayout = function getLayout(page: ReactElement) {
  return <IFrameThemeProvider>{page}</IFrameThemeProvider>;
};

export default App;
