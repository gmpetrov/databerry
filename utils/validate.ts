import { NextApiResponse } from 'next';
import { z } from 'zod';

import { AppNextApiRequest } from '@app/types';

export type options = {
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
};

export type Handle<T> = (
  req: AppNextApiRequest,
  res: NextApiResponse
) => Promise<T>;

export function validate<T>(
  config: {
    handler: Handle<T>;
  } & options
) {
  return async (req: AppNextApiRequest, res: NextApiResponse) => {
    if (config?.query) {
      try {
        config.query.parse(req.query);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error('error parsing request query', err.issues);

          return res.status(400).json({
            error: 'error invalid request query',
            details: err.format(),
          });
        }

        return res.status(400).json({ error: 'error invalid request query' });
      }
    }

    // let body: undefined;
    if (config?.body) {
      try {
        config.body.parse(req.body);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error('error parsing request body', err.issues);

          return res.status(400).json({
            error: 'error invalid request body',
            details: err.format(),
          });
        }

        return res.status(400).json({ error: 'error invalid request body' });
      }
    }

    return config.handler(req, res);
  };
}

export default validate;
