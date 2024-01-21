import { NextApiResponse } from 'next';

import { ApiError, ApiErrorType } from '@chaindesk/lib/api-error';
import { createApiHandler, respond } from '@chaindesk/lib/createa-api-handler';
import appEventHandlers from '@chaindesk/lib/events/handlers';
import { AppeEventHandlerSchema } from '@chaindesk/lib/types/dtos';
import { AppNextApiRequest } from '@chaindesk/lib/types/index';
import validate from '@chaindesk/lib/validate';

const handler = createApiHandler();

export const handleEvent = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const { token, event } = AppeEventHandlerSchema.parse(req.body);

  if (token !== process.env.JWT_SECRET) {
    throw new ApiError(ApiErrorType.UNAUTHORIZED);
  }

  return appEventHandlers[event.type](event as any);
};

handler.post(
  validate({
    body: AppeEventHandlerSchema,
    handler: respond(handleEvent),
  })
);

export default handler;
