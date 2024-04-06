import ChatBoxLoader from '@app/components/ChatBoxLoader';

import ChatBubble from '@chaindesk/ui/embeds/chat-bubble';
import { cn } from '@chaindesk/ui/utils/cn';

import createElement from '../common/create-element';

const name = 'chaindesk-chatbox-bubble';

const element = createElement({
  widget: (props: any) => (
    <ChatBoxLoader
      {...props}
      className={cn('chaindesk-widget', props.className)}
      // eslint-disable-next-line
      children={ChatBubble}
    />
  ),
  name,
});

customElements.define(name, element);

export default element;
