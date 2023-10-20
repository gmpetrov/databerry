import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@chaindesk/lib/auth';
import { RouteNames } from '@chaindesk/lib/types';

export function withAuth<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(gssp: (context: GetServerSidePropsContext) => any) {
  return async (ctx: GetServerSidePropsContext) => {
    const session = await getServerSession(
      ctx.req,
      ctx.res,
      authOptions(ctx.req as any)
    );

    if (!session) {
      return {
        redirect: {
          statusCode: 302,
          destination: `${RouteNames.SIGN_IN}?redirect=${encodeURIComponent(
            (ctx as any)?.req?.url
          )}`,
          //       ctx.req.url
          //     )}`,
          // destination: RouteNames.SIGN_IN,
          // destination: ctx.req.url.includes('_next')
          //   ? RouteNames.SIGN_IN
          //   : `${RouteNames.SIGN_IN}?redirect=${encodeURIComponent(
          //       ctx.req.url
          //     )}`,
        },
      };
    }

    (ctx as any).req.session = session;

    return await gssp(ctx);
  };
}
