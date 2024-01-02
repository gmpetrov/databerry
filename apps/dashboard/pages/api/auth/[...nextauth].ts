import { NextApiRequest, NextApiResponse } from 'next/types';
import NextAuth, { AuthOptions } from 'next-auth';

import { authOptions } from '@chaindesk/lib/auth';

export default function Auth(
  req: NextApiRequest,
  res: NextApiResponse,
  ...args: any
) {
  const protocol =
    !req.headers.host?.includes('localhost') &&
    (req.headers['x-forwarded-proto'] || (req?.connection as any)?.encrypted)
      ? 'https'
      : 'http';

  const url = `${protocol}://${req.headers.host}`;

  process.env.NEXTAUTH_URL = url;

  return NextAuth(authOptions(req))(req, res, ...args);
}
