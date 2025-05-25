import { NextRequest, NextResponse } from 'next/server';
import { resetAllUserArticleLimits } from '@/lib/services/article-access-service';

// Force Node.js runtime for article access service compatibility
export const runtime = 'nodejs';

/**
 * API route to reset article counts for all users
 * This should be called by a cron job at the beginning of each month
 *
 * @param req NextRequest
 * @returns NextResponse
 */
export async function GET() {
  try {

    // Reset article counts for all users
    const result = await resetAllUserArticleLimits();

    return NextResponse.json({
      success: true,
      message: 'Article counts reset successfully',
      usersUpdated: result.count
    });
  } catch (error) {
    console.error('Error resetting article counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
