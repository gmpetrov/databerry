import WebChatBubble from './web-components/chatbubble';
import { ChaindeskFactory } from './types';
import { hookFunctionsToWindow } from './utils';
export const initChatBubble = async (props: {
  agentId: string;
  onMarkedAsResolved?(): any;
}) => {
  hookFunctionsToWindow(props);
  const webChatBubble = new WebChatBubble();
  webChatBubble.setAttribute('agent-id', props.agentId);

  props.onMarkedAsResolved &&
    webChatBubble.setAttribute(
      'on-marked-as-resolved',
      props.onMarkedAsResolved.name
    );

  document.body.appendChild(webChatBubble);
};

export const generateFactory = () => ({
  initChatBubble,
});

// TODO: used to overcome the issue of module has no default export, directly use ChaindeskFactory if issue solved.
export const injectFactoryInWindow = (factory: ChaindeskFactory) => {
  if (typeof window === 'undefined') return;
  window.ChaindeskFactory = { ...factory };
};
