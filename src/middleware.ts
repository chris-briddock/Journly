import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Main Middleware] Processing path: ${path}`);

  // Protect posts listing page
  if (path === '/posts') {
    console.log(`[Main Middleware] Handling posts listing page`);
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    const userId = token?.sub || null;

    // If the user is not logged in, redirect to the login page
    if (!userId) {
      console.log(`[Main Middleware] Redirecting to login page`);
      return NextResponse.redirect(new URL('/login?from=/posts', request.url));
    }
  }

  // For individual post pages, we'll handle access control in the page component
  // instead of middleware to avoid Prisma Edge Runtime issues
  if (path.startsWith('/posts/') && path !== '/posts/' && !path.includes('/edit/') && !path.includes('/preview')) {
    console.log(`[Main Middleware] Handling individual post page`);

    // Just check if user is logged in - detailed access control will be in the page component
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    const userId = token?.sub || null;

    // If the user is not logged in, redirect to the login page
    if (!userId) {
      console.log(`[Main Middleware] Redirecting to login page`);
      return NextResponse.redirect(new URL('/login?from=' + path, request.url));
    }

    console.log(`[Main Middleware] User authenticated, allowing access to post page`);
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
