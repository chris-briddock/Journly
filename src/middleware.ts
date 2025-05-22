import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect posts listing page
  if (path === '/posts') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    const userId = token?.sub || null;

    // If the user is not logged in, redirect to the login page
    if (!userId) {
      return NextResponse.redirect(new URL('/login?from=/posts', request.url));
    }
  }

  // Protect individual post pages
  if (path.startsWith('/posts/') && path !== '/posts/') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    const userId = token?.sub || null;

    // If the user is not logged in, redirect to the login page
    if (!userId) {
      return NextResponse.redirect(new URL(`/login?from=${path}`, request.url));
    }

    // For logged-in users, we'll check premium access in the page component
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/posts',
    '/posts/:path*',
  ],
};
