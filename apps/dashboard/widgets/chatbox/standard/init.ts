import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow } from '../utils';

import WebChatBoxFrame from './standard';

const initStandard = async (props: InitWidgetProps) => {
  hookFunctionsToWindow(props);

  const element = new WebChatBoxFrame();

  setupAttributes({
    element,
    ...props,
  });

  document?.body?.appendChild(element);
};

export default initStandard;
