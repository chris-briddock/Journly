import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { articleAccessMiddleware } from './middleware/article-access';

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

  // Protect individual post pages (but not preview pages)
  if (path.startsWith('/posts/') && path !== '/posts/' && !path.includes('/edit/') && !path.includes('/preview')) {
    console.log(`[Main Middleware] Handling individual post page`);

    // Extract the post ID from the path
    const postId = path.split('/')[2];
    console.log(`[Main Middleware] Extracted post ID: ${postId}`);

    // Use the article access middleware
    console.log(`[Main Middleware] Calling article access middleware`);
    const response = await articleAccessMiddleware(request, postId);

    // If the middleware returns a response, return it
    if (response) {
      console.log(`[Main Middleware] Middleware returned a response, redirecting`);
      return response;
    }

    console.log(`[Main Middleware] Middleware allowed access`);
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
