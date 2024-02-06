import type { BubbleProps } from '@app/components/ChatBubble';

import setupAttributes from '../common/setup-attributes';
import { hookFunctionsToWindow } from '../utils';

import ChatboxBubble from './bubble';
const initBubble = async (props: BubbleProps) => {
  if (typeof window !== 'undefined' && !(window as any)?.ChatboxBubble) {
    const currentScriptSrc = (document?.currentScript as any)?.src;

    let agentId = props.agentId;

    if (!agentId && currentScriptSrc) {
      const urlObj = new URL(currentScriptSrc);
      agentId = urlObj.searchParams.get('agentId') || props.agentId;
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
