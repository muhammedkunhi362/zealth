import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Update session expiration if a token exists
  const response = await updateSession(request) || NextResponse.next();

  const token = request.cookies.get('zealth_token')?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || 
                      request.nextUrl.pathname === '/login' ||
                      request.nextUrl.pathname === '/register';
                      
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/assessment') && request.nextUrl.pathname !== '/assessment/intro'; // Or just /assessment

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
