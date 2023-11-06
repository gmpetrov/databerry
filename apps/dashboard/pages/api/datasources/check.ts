import { NextApiResponse } from 'next';

import {
  createAuthApiHandler,
  respond,
} from '@chaindesk/lib/createa-api-handler';
import { DatasourceLoader } from '@chaindesk/lib/loaders';
import { AppNextApiRequest } from '@chaindesk/lib/types';
import { DatasourceSchema } from '@chaindesk/lib/types/models';
import validate from '@chaindesk/lib/validate';
import { AppDatasource } from '@chaindesk/prisma';

const handler = createAuthApiHandler();

export const checkDatasource = async (
  req: AppNextApiRequest,
  res: NextApiResponse
) => {
  const data = req.body as DatasourceSchema;
  const session = req.session;
  let isValid = true;
  let message = '';
  let size = 0;

  try {
    size = await new DatasourceLoader({
      id: 'ID',
      config: data.config,
      type: data.type,
      name: data.name,
      datastoreId: data.datastoreId,
    } as AppDatasource).getSize(data.datasourceText);
  } catch (err) {
    req.logger.error((err as any)?.response?.status);
  }

  if (!session.organization?.isPremium && size / 1000000 > 1.1) {
    isValid = false;
    message =
      'The maximum file size is 1MB on the free plan. Contact support@chaindesk.ai to upgrade your account';
  }

  return {
    valid: isValid,
    message,
    size,
  };
};

handler.post(
  validate({
    body: DatasourceSchema,
    handler: respond(checkDatasource),
  })
);

export default handler;
