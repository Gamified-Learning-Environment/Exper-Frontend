import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/quiz',
  '/profile',
  '/api/users',
  '/api/quiz'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');

  if (!token && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

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