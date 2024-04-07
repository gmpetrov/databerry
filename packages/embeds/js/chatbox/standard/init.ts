import { ChatBoxStandardProps } from '@chaindesk/ui/ChatBoxLoader';

import setupAttributes from '@chaindesk/ui/embeds/common/setup-attributes';
import { hookFunctionsToWindow } from '@chaindesk/ui/embeds/common/utils';

import ChatboxStandard, { name } from './standard';

const initStandard = (props: ChatBoxStandardProps) => {
  if (!customElements.get(name)) {
    customElements.define(name, ChatboxStandard);
  }

  hookFunctionsToWindow(props);

  const id = `ChatBoxStandard_` + (props.id || '');
  const element = new ChatboxStandard({ instanceId: id });

  const standardElement = props.id
    ? (document.querySelector(`${name}[id="${props.id}"]`) as HTMLElement)
    : (document.querySelector(name) as HTMLElement);
  if (!standardElement)
    throw new Error(
      `<${name}> element${`${
        props.id ? ` with ID ${props.id}` : ``
      }`} not found.`
    );

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

  return (window as any)[id] as typeof element;
};

export default initStandard;
