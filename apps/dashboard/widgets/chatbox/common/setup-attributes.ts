import { hookFunctionsToWindow, toDashedCase } from '../utils';

import { InitWidgetProps } from './types';

const setupAttributes = (
  props: {
    element: HTMLElement;
  } & InitWidgetProps & {
      interface?: InitWidgetProps['initConfig'];
    }
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

  if (props.id) {
    props.element.setAttribute('id', props.id);
  }

  if (props.context) {
    props.element.setAttribute('context', props.context);
  }

  if (props.interface) {
    props.element.setAttribute('interface', JSON.stringify(props.interface));
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
