import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canAccessArticle, recordArticleAccess } from '@/lib/services/article-access-service';

// GET /api/posts/[id]/access - Check if user can access a post and record access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await auth();

    // Require authentication
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required', canAccess: false },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if the user can access the article
    const canAccess = await canAccessArticle(userId, postId);

    if (canAccess) {
      // Record the access if the user can access the article
      await recordArticleAccess(userId, postId);
    }

    return NextResponse.json({
      canAccess,
      userId,
      postId
    });
  } catch (error) {
    console.error('Error checking article access:', error);
    return NextResponse.json(
      { error: 'Internal server error', canAccess: false },
      { status: 500 }
    );
  }
}
