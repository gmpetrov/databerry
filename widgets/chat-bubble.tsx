import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ChatBubble from '@app/components/ChatBubble';

if (typeof window !== 'undefined') {
  addEventListener('DOMContentLoaded', (event) => {
    const me = document.querySelector('script[data-name="databerry-widget"]');
    console.log('CALLLED ------------->', me?.id);
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    root.render(
      <StrictMode>
        <ChatBubble agentId={me?.id || 'clgqxreyd0000ya0u5hb560qs'} />
      </StrictMode>
    );
  });
}
