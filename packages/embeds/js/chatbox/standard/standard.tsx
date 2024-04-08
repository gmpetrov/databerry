import ChatBoxLoader from '@chaindesk/ui/ChatBoxLoader';
import ChatboxNavBarLayout from '@chaindesk/ui/ChatboxNavBarLayout';
import { cn } from '@chaindesk/ui/utils/cn';

import createElement from '@chaindesk/ui/embeds/common/create-element';

export const name = 'chaindesk-chatbox-standard';

const element = createElement({
  type: 'chatbox',
  widget: (props: any) => (
    <ChatBoxLoader
      layout={ChatboxNavBarLayout}
      {...props}
      className={cn('chaindesk-widget', props.className)}
    />
  ),
  name,
});

export default element;
