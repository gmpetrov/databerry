import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow } from '../utils';

import ChatboxStandard from './standard';

const initStandard = async (props: InitWidgetProps) => {
  hookFunctionsToWindow(props);

  const element = new ChatboxStandard();

  setupAttributes({
    element,
    ...props,
  });

  document?.body?.appendChild(element);
};

export default initStandard;
