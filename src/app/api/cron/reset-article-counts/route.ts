import { NextRequest, NextResponse } from 'next/server';
import { resetAllUserArticleLimits } from '@/lib/services/article-access-service';

/**
 * API route to reset article counts for all users
 * This should be called by a cron job at the beginning of each month
 * 
 * @param req NextRequest
 * @returns NextResponse
 */
export async function GET(req: NextRequest) {
  try {
    // Check for authorization header with API key
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const apiKey = authHeader.split(' ')[1];
    
    // Verify API key matches environment variable
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
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
