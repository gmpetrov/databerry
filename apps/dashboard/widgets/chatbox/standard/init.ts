import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow } from '../utils';

import ChatboxStandard, { name } from './standard';

const initStandard = async (props: InitWidgetProps) => {
  hookFunctionsToWindow(props);

  const element = new ChatboxStandard();

  const standardElement = document.querySelector(name) as HTMLElement;
  if (!standardElement) throw new Error(`<${name}> element not found.`);

  const mergedStyles = {
    ...props.styles,
    ...Array.from(standardElement.style).reduce((acc, curr) => {
      (acc as any)[curr as any] = standardElement?.style.getPropertyValue(curr);
      return acc;
    }, {}),
  };

  setupAttributes({
    element,
    ...props,
    styles: mergedStyles,
  });

  standardElement.replaceWith(element);
};

export default initStandard;
