import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow, toDashedCase } from '../utils';

import ChatboxBubble from './bubble';
const initBubble = async (props: InitWidgetProps) => {
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

  const element = new ChatboxBubble();

  setupAttributes({
    element,
    ...props,
  });

  document?.body?.prepend(element);
};

export default initBubble;
