import { SxProps } from '@mui/joy/styles/types';

import { hookFunctionsToWindow } from '../utils';

import WebChatBoxFrame from './standard';

const initStandard = async (props: { agentId?: string; styles?: SxProps }) => {
  let agentId = props.agentId;

  hookFunctionsToWindow(props);
  const webChatBox = new WebChatBoxFrame();

  webChatBox.setAttribute('agent-id', agentId || '');
  if (props.styles) {
    console.log('before', props.styles);
    console.log('after', JSON.stringify(props.styles));
    webChatBox.setAttribute('styles', JSON.stringify(props.styles));
  }

  document?.body?.appendChild(webChatBox);
};

export default initStandard;
