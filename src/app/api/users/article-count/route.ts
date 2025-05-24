import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getArticlesReadThisMonth, getMonthlyArticleLimit } from '@/lib/services/article-access-service';

/**
 * API route to get a user's article count and limit
 */
export async function GET() {
  try {
    // Get the user's session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user's article count and limit
    const articlesReadThisMonth = await getArticlesReadThisMonth(session.user.id);
    const monthlyArticleLimit = await getMonthlyArticleLimit(session.user.id);
    
    return NextResponse.json({
      articlesReadThisMonth,
      monthlyArticleLimit
    });
  } catch (error) {
    console.error('Error getting article count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
