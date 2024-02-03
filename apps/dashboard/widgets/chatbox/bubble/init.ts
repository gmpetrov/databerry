import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow, toDashedCase } from '../utils';

import WebChatBubble from './bubble';
const initChatBubble = async (props: InitWidgetProps) => {
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

  const element = new WebChatBubble();

  setupAttributes({
    element,
    ...props,
  });

  document?.body?.appendChild(element);
};

export default initChatBubble;
