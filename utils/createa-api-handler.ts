import { NextApiRequest, NextApiResponse } from 'next';
import nc, { ErrorHandler } from 'next-connect';

import { AppNextApiRequest } from '@app/types';
import auth from '@app/utils/auth';

import { ApiError } from './api-error';
import { Handle, options } from './validate';

export const onError: ErrorHandler<NextApiRequest, NextApiResponse> = (
  err,
  req,
  res,
  next
) => {
  console.log('err', err);
  res.status(500).end(err.toString());
};

export const createApiHandler = (opts?: options) =>
  nc<NextApiRequest, NextApiResponse>({
    onError,
  });

export const createAuthApiHandler = (opts?: options) =>
  nc<AppNextApiRequest, NextApiResponse>({
    onError,
  }).use(auth);

export function respond<T>(f: Handle<T>) {
  return async (req: AppNextApiRequest, res: NextApiResponse) => {
    try {
      const result = await f(req, res);
      res.json(result);
    } catch (err) {
      console.log(err);
      res.statusCode = (err as any)?.status || 500;

      let message = '';

      if (err instanceof ApiError) {
        message = err.message;
      } else {
        message = (err as any).toString
          ? (err as any).toString()
          : JSON.stringify(err);
      }

      res.json({
        error: message,
      });
    }
  };
}
