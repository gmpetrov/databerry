import { hookFunctionsToWindow, toDashedCase } from '../utils';

import { InitWidgetProps } from './types';

const setupAttributes = (
  props: {
    element: HTMLElement;
  } & InitWidgetProps
) => {
  props.element.setAttribute('agent-id', props.agentId || '');

  if (props.contact) {
    for (const key of Object.keys(props.contact)) {
      props.element.setAttribute(
        toDashedCase(key),
        props.contact?.[key as keyof typeof props.contact] || ''
      );
    }
  }

  if (props.context) {
    props.element.setAttribute('context', props.context);
  }

  if (props.initialMessages && props.initialMessages.length > 0) {
    props.element.setAttribute(
      'initial-messages',
      JSON.stringify(props.initialMessages)
    );
  }

  if (props.styles) {
    console.log('before', props.styles);
    console.log('after', JSON.stringify(props.styles));
    props.element.setAttribute('styles', JSON.stringify(props.styles));
  }

  if (props?.onMarkedAsResolved) {
    props.element.setAttribute(
      'on-marked-as-resolved',
      props?.onMarkedAsResolved.name
    );
  }

  return props.element;
};

export default setupAttributes;
