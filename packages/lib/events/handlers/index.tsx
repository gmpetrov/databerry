import { AppEventSchema } from '@chaindesk/lib/types/dtos';

import humanRequested from '../handlers/human-requested';
import leadCaptured from '../handlers/lead-captured';
import toolApprovalRequired from '../handlers/tool-approval-requested';
import { AppEventHandler } from '../type';

import conversationResolved from './conversation-resolved';
import formSubmissionHandler from './form-submission';

type AppEventHandlers = {
  [K in AppEventSchema['type']]: (
    event: Extract<AppEventSchema, { type: K }>
  ) => Promise<void>;
};

export default {
  'form-submission': formSubmissionHandler,
  'tool-approval-requested': toolApprovalRequired,
  'conversation-resolved': conversationResolved,
  'human-requested': humanRequested,
  'lead-captured': leadCaptured,
} as AppEventHandlers;
