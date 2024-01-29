import { CustomContact } from '@app/components/ChatBubble';

import WebChatBubble from './web-components/chatbubble';
import { hookFunctionsToWindow, toDashedCase } from './utils';

export const initChatBubble = async (props: {
  agentId?: string;
  onMarkedAsResolved?(): any;
  contact?: CustomContact;
}) => {
  const currentScriptSrc = (document?.currentScript as any)?.src;
  // To fix retro-compatibility.
  const currentScriptId = (document?.currentScript as any)?.id;

  let agentId;
  if (props.agentId) {
    agentId = props.agentId;
  } else if (currentScriptId) {
    agentId = currentScriptId;
  } else if (currentScriptSrc) {
    const urlObj = new URL(currentScriptSrc);
    agentId =
      urlObj?.searchParams?.get('agentId') || currentScriptId || props?.agentId;
  }

  hookFunctionsToWindow(props);
  const webChatBubble = new WebChatBubble();

  webChatBubble.setAttribute('agent-id', agentId || '');

  if (props.contact) {
    for (const info in props.contact) {
      webChatBubble.setAttribute(toDashedCase(info), info || '');
    }
  }

  props?.onMarkedAsResolved &&
    webChatBubble.setAttribute(
      'on-marked-as-resolved',
      props?.onMarkedAsResolved.name
    );

  document?.body?.appendChild(webChatBubble);
};

export const generateFactory = () => ({
  initChatBubble,
});

// TODO: workaround to module has no default export, directly use ChaindeskFactory when issue solved.
export const injectFactoryInWindow = (factory: any) => {
  if (typeof window === 'undefined') return;
  window.ChaindeskFactory = { ...factory };
};
