import { Session } from 'next-auth';

import { ApiError, ApiErrorType } from '../api-error';

import type { Middleware } from './pipe';

const roles = (roles: Session['roles']): Middleware => {
  return (req, res) => {
    const session = req.session;

    if (!(session?.roles || []).some((role) => roles.includes(role))) {
      throw new ApiError(ApiErrorType.UNAUTHORIZED);
    }
  };
};

export default roles;
