import { Session } from 'next-auth';
import requestIp from 'request-ip';

import { ApiError, ApiErrorType } from '../api-error';
import rateLimiter from '../rate-limiter';
import redis from '../redis-client';

import type { Middleware } from './pipe';

const rateLimit = ({
  limit = 1,
  duration = 60,
  disabledForCustomers = false,
}: {
  duration?: number;
  limit?: number;
  disabledForCustomers?: boolean;
}): Middleware => {
  return async (req, res) => {
    const session = req.session;

    if (!!session?.user && disabledForCustomers) {
      // We don't apply rate limiting to dashboard authenticated users
      return;
    }

    const identifier = requestIp.getClientIp(req);

    console.log('identifier');

    if (!identifier) {
      console.log('No IP address found in request');
      return;
    }

    const result = await rateLimiter({
      client: redis,
      ip: identifier,
      limit,
      duration,
    });

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.success) {
      throw new ApiError(ApiErrorType.RATE_LIMIT);
    }
  };
};

export default rateLimit;
