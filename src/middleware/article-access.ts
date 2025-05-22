import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { canAccessArticle, recordArticleAccess } from '@/lib/services/article-access-service';
import prisma from '@/lib/prisma';

// Middleware to check if a user can access an article
export async function articleAccessMiddleware(
  req: NextRequest,
  postId: string
): Promise<NextResponse | null> {
  try {
    // Get the user's session
    const token = await getToken({ req });
    const userId = token?.sub || null;

    // If the user is not logged in, redirect to the login page immediately
    if (!userId) {
      return NextResponse.redirect(new URL('/login?from=' + req.nextUrl.pathname, req.url));
    }

    // Check if the user can access the article
    const canAccess = await canAccessArticle(userId, postId);

    if (!canAccess) {
      // If the user is logged in but can't access the article, redirect to the subscription page
      return NextResponse.redirect(new URL('/subscription?from=' + req.nextUrl.pathname, req.url));
    }

    // If the user can access the article, record the access
    await recordArticleAccess(userId, postId);

    // Allow access
    return null;
  } catch (error) {
    console.error('Error checking article access:', error);
    return null;
  }
}

// Middleware to check if a post is premium
export async function isPostPremium(postId: string): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ isPremium: boolean }>>`
      SELECT "isPremium" FROM "Post" WHERE id = ${postId}
    `;

    return result && result.length > 0 ? result[0].isPremium : false;
  } catch (error) {
    console.error('Error checking if post is premium:', error);
    return false;
  }
}
