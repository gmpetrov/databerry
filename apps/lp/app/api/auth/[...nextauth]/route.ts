import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';

import { authOptions } from '@chaindesk/lib/auth-app-router';

interface RouteHandlerContext {
  params: { nextauth: string[] };
}

async function handler(
  req: NextRequest,
  context: RouteHandlerContext,
  ...args: any
) {
  const headersList = headers();

  const host = headersList.get('host');
  const protocol =
    host?.includes('localhost') && headersList.get('x-forwarded-proto')
      ? 'https'
      : 'http';

  const url = `${protocol}://${host}`;

  process.env.NEXTAUTH_URL = url;

  return await NextAuth(req, context, authOptions(req));
}

export { handler as GET, handler as POST };
