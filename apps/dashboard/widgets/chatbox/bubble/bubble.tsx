import ChatBubble from '@app/components/ChatBubble';

import createElement from '../common/create-element';

const name = 'chat-bubble';

const element = createElement({
  widget: ChatBubble,
  name,
});

customElements.define(name, element);

export default element;
