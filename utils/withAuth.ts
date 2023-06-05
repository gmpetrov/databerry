import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@app/pages/api/auth/[...nextauth]';
import { RouteNames } from '@app/types';

export const withAuth: (fn: any) => GetServerSideProps = (gssp) => {
  return async (ctx) => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

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
};
