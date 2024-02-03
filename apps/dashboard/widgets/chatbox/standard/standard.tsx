import ChatBoxFrame from '@app/components/ChatBoxFrame';

import createElement from '../common/create-element';

export const name = 'chaindesk-chatbox-standard';

const element = createElement({
  widget: ChatBoxFrame,
  name,
});

customElements.define(name, element);

export default element;
