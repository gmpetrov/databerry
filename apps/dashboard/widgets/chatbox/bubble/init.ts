import { CustomContact } from '@app/components/ChatBubble';

import { AgentInterfaceConfig } from '@chaindesk/lib/types/models';

import { hookFunctionsToWindow, toDashedCase } from '../utils';

import WebChatBubble from './bubble';
const initChatBubble = async (props: {
  agentId?: string;
  onMarkedAsResolved?(): any;
  contact?: CustomContact;
  initConfig: AgentInterfaceConfig;
}) => {
  const currentScriptSrc = (document?.currentScript as any)?.src;

  // To fix retro-compatibility.
  const currentScriptId = (document?.currentScript as any)?.id;

  let agentId = props.agentId || currentScriptId;

  if (!agentId && currentScriptSrc) {
    const urlObj = new URL(currentScriptSrc);
    agentId =
      urlObj.searchParams.get('agentId') || currentScriptId || props.agentId;
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

export default initChatBubble;
