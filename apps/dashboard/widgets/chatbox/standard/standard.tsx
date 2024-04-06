import ChatBoxLoader from '@app/components/ChatBoxLoader';
import ChatboxNavBarLayout from '@app/components/ChatboxNavBarLayout';

import { cn } from '@chaindesk/ui/utils/cn';

import createElement from '../common/create-element';

export const name = 'chaindesk-chatbox-standard';

const element = createElement({
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
