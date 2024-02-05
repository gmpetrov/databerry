import type { BubbleProps } from '@app/components/ChatBubble';

import setupAttributes from '../common/setup-attributes';
import { hookFunctionsToWindow, toDashedCase } from '../utils';

import ChatboxBubble from './bubble';
const initBubble = async (props: BubbleProps) => {
  if (typeof window !== 'undefined' && !(window as any)?.ChatboxBubble) {
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

    (window as any).ChatboxBubble = element;

    document?.body?.prepend(element);
  }
};

export default initBubble;
