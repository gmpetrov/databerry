import { NextApiResponse } from 'next';

import { AppNextApiRequest } from '@chaindesk/lib/types';

export type Middleware = (
  req: AppNextApiRequest,
  res: NextApiResponse
) => unknown;

function pipe(...middlewares: Middleware[]) {
  return async function withMiddlewareHandler(
    req: AppNextApiRequest,
    res: NextApiResponse
  ) {
    async function evaluateHandler(
      middleware: Middleware,
      innerMiddleware?: Middleware
    ) {
      // return early when the request has
      // been ended by a previous middleware
      if (res.headersSent) {
        return;
      }

      if (typeof middleware === 'function') {
        const handler = await middleware(req, res);

        if (typeof handler === 'function') {
          if (innerMiddleware) {
            await handler(innerMiddleware);

            const index = middlewares.indexOf(innerMiddleware);

            // remove inner middleware
            if (index >= 0) {
              middlewares.splice(index, 1);
            }
          } else {
            await handler();
          }
        }
      }
    }

    for (let index = 0; index < middlewares.length; index++) {
      const middleware = middlewares[index];
      const nextMiddleware = middlewares[index + 1];

      await evaluateHandler(middleware, nextMiddleware);
    }
  };
}

export default pipe;
