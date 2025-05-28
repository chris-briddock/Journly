import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper function to check if user is authenticated
async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Check if token exists and has a valid user ID
    const isValid = !!(token?.sub && token.sub.length > 0);
    console.log(`[Auth Check] Token exists: ${!!token}, User ID: ${token?.sub || 'none'}, Valid: ${isValid}`);

    return isValid;
  } catch (error) {
    console.error(`[Auth Check] Error validating token:`, error);
    return false;
  }
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`[Main Middleware] Processing path: ${path}`);

  // Protect posts listing page
  if (path === '/posts') {
    console.log(`[Main Middleware] Handling posts listing page`);

    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      console.log(`[Main Middleware] User not authenticated, redirecting to login`);
      return NextResponse.redirect(new URL('/login?from=/posts', request.url));
    }

    console.log(`[Main Middleware] User authenticated, allowing access to posts listing`);
  }

  // For individual post pages, we'll handle access control in the page component
  // instead of middleware to avoid Prisma Edge Runtime issues
  if (path.startsWith('/posts/') && path !== '/posts/' && !path.includes('/edit/') && !path.includes('/preview')) {
    console.log(`[Main Middleware] Handling individual post page`);

    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      console.log(`[Main Middleware] User not authenticated, redirecting to login`);
      return NextResponse.redirect(new URL('/login?from=' + encodeURIComponent(path), request.url));
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
