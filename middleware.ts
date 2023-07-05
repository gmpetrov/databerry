import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const host = req.headers.get('host');
  const hostname = req.headers
    .get('host')!
    .replace(`.${process.env.NEXT_PUBLIC_CHAT_PAGE_ROOT_DOMAIN}`, ``);

  if (
    host?.includes(`.${process.env.NEXT_PUBLIC_CHAT_PAGE_ROOT_DOMAIN}`) &&
    url?.pathname === '/'
  ) {
    const url = req.nextUrl.clone();

    url.pathname = `/agents/${hostname}/page`;

    return NextResponse.rewrite(url);
  }
}
