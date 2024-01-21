import { AppEventSchema } from '@chaindesk/lib/types/dtos';

import toolApprovalRequired from '../handlers/tool-approval-requested';
import { AppEventHandler } from '../type';

import formSubmissionHandler from './blablaform-submission';

type AppEventHandlers = {
  [K in AppEventSchema['type']]: (
    event: Extract<AppEventSchema, { type: K }>
  ) => Promise<void>;
};

export default {
  'blablaform-submission': formSubmissionHandler,
  'tool-approval-requested': toolApprovalRequired,
} as AppEventHandlers;
