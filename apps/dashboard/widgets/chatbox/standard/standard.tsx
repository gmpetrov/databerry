import ChatBoxFrame from '@app/components/ChatBoxFrame';
import ChatboxNavBarLayout from '@app/components/ChatboxNavBarLayout';

import { cn } from '@chaindesk/ui/utils/cn';

import createElement from '../common/create-element';

export const name = 'chaindesk-chatbox-standard';

const element = createElement({
  widget: (props: any) => (
    <ChatBoxFrame
      layout={ChatboxNavBarLayout}
      {...props}
      className={cn('chaindesk-widget', props.className)}
    />
  ),
  name,
});

export default element;
