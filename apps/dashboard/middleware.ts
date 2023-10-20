import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (
    (!req.url.includes('datasources') &&
      !req.url.includes('datastores') &&
      req.url.includes('api')) ||
    req.url.includes('iframe') ||
    req.url.includes('standalone')
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/maintenance';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/agents/:path*',
    '/datastores/:path*',
    '/chat/:path*',
    '/logs/:path*',
    '/settings/:path*',
  ],
};
