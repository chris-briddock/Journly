import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canAccessArticle, recordArticleAccess } from '@/lib/services/article-access-service';

// Middleware to check if a user can access an article
export async function articleAccessMiddleware(
  req: NextRequest,
  postId: string
): Promise<NextResponse | null> {
  try {
    console.log(`[Middleware] Checking access for post: ${postId}`);

    // Get the user's session
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub || null;

    console.log(`[Middleware] User ID: ${userId || 'not logged in'}`);

    // If the user is not logged in, redirect to the login page immediately
    if (!userId) {
      console.log(`[Middleware] Redirecting to login page`);
      return NextResponse.redirect(new URL('/login?from=' + req.nextUrl.pathname, req.url));
    }

    // Check if the user can access the article
    const canAccess = await canAccessArticle(userId, postId);
    console.log(`[Middleware] Can access: ${canAccess}`);

    if (!canAccess) {
      // If the user is logged in but can't access the article, redirect to the subscription page
      console.log(`[Middleware] Redirecting to subscription page`);
      return NextResponse.redirect(new URL('/subscription?from=' + req.nextUrl.pathname, req.url));
    }

    // If the user can access the article, record the access
    console.log(`[Middleware] Recording article access for user: ${userId}, post: ${postId}`);
    await recordArticleAccess(userId, postId);
    console.log(`[Middleware] Access recorded successfully`);

    // Allow access
    return null;
  } catch (error) {
    console.error('Error checking article access:', error);
    return null;
  }
}

// Premium content check removed - all articles are treated equally with a monthly limit
