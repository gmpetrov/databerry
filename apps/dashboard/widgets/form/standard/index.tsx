import ChatBoxLoader from '@app/components/ChatBoxLoader';
import ChatboxNavBarLayout from '@app/components/ChatboxNavBarLayout';

import TraditionalForm from '@chaindesk/ui/embeds/forms/traditional';
import { cn } from '@chaindesk/ui/utils/cn';

import createElement from '../../chatbox/common/create-element';

export const name = 'chaindesk-form-standard';

const element = createElement({
  widget: (props: any) => {
    return (
      <TraditionalForm
        // formId={formId}
        // conversationId={conversationId}
        // messageId={messageId}
        // config={config}
        {...props}
      />
    );
  },
  name,
});

export default element;
