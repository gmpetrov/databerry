import { ChatBoxStandardProps } from '@app/components/ChatBoxFrame';

import setupAttributes from '../common/setup-attributes';
import { InitWidgetProps } from '../common/types';
import { hookFunctionsToWindow } from '../utils';

import ChatboxStandard, { name } from './standard';

const initStandard = async (props: ChatBoxStandardProps) => {
  if (!customElements.get(name)) {
    customElements.define(name, ChatboxStandard);
  }

  hookFunctionsToWindow(props);

  const element = new ChatboxStandard();

  const standardElement = props.id
    ? (document.querySelector(`${name}[id="${props.id}"]`) as HTMLElement)
    : (document.querySelector(name) as HTMLElement);
  if (!standardElement)
    throw new Error(
      `<${name}> element${`${
        props.id ? ` with ID ${props.id}` : ``
      }`} not found.`
    );

  const id = `ChatBoxStandard_` + (props.id || '');

  if (!(window as any)[id]) {
    const mergedStyles = {
      ...props.styles,
      ...Array.from(standardElement.style).reduce((acc, curr) => {
        (acc as any)[curr as any] =
          standardElement?.style.getPropertyValue(curr);
        return acc;
      }, {}),
    };

    setupAttributes({
      element,
      ...props,
      styles: mergedStyles,
    });

    (window as any)[id] = element;

    standardElement.replaceWith(element);
  }
};

export default initStandard;
