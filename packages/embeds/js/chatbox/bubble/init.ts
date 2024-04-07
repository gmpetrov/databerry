import type { BubbleProps } from '@chaindesk/ui/embeds/chat-bubble';

import setupAttributes from '@chaindesk/ui/embeds/common/setup-attributes';
import { hookFunctionsToWindow } from '@chaindesk/ui/embeds/common/utils';

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

    const element = new ChatboxBubble({ instanceId: 'ChatBoxBubble' });

    setupAttributes({
      element,
      ...props,
    });

    (window as any).ChatboxBubble = element;

    document?.body?.prepend(element);
  }
  return (window as any)?.ChatboxBubble as HTMLElement;
};

export default initBubble;
