import TraditionalForm from '@chaindesk/ui/embeds/forms/traditional';

import createElement from '../../chatbox/common/create-element';

export const name = 'chaindesk-form-standard';

const element = createElement({
  widget: (props: any) => {
    return <TraditionalForm {...props} />;
  },
  name,
});

export default element;
