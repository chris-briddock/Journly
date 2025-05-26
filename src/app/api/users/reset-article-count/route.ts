import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resetUserArticleLimit } from '@/lib/services/article-access-service';

// Force Node.js runtime for article access service compatibility
export const runtime = 'nodejs';

/**
 * API route to reset a user's article count
 * This is called by the client when the user's last reset date is before the start of the current month
 */
export async function POST() {
  try {
    // Get the user's session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Reset the user's article count
    await resetUserArticleLimit(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Article count reset successfully'
    });
  } catch (error) {
    console.error('Error resetting article count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
