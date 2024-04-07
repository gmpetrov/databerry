import TraditionalForm from '@chaindesk/ui/embeds/forms/traditional';

import createElement from '@chaindesk/ui/embeds/common/create-element';

export const name = 'chaindesk-form-standard';

const element = createElement({
  widget: (props: any) => {
    return <TraditionalForm {...props} />;
  },
  name,
});

export default element;
