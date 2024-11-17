import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/quiz/:path*',
    '/profile/:path*',
    '/api/users/:path*',
    '/api/quiz/:path*',
  ],
};