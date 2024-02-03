import ChatBubble from '@app/components/ChatBubble';

import createElement from '../common/create-element';

const name = 'chaindesk-chatbox-bubble';

const element = createElement({
  widget: ChatBubble,
  name,
});

customElements.define(name, element);

export default element;
