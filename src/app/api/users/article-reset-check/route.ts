import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * API route to check if a user's article count needs to be reset
 * Returns the user's last article reset date
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

    // Get the user's last article reset date
    const user = await prisma.$queryRaw`
      SELECT "lastArticleResetDate" FROM "User" WHERE id = ${session.user.id}
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lastArticleResetDate: user[0].lastArticleResetDate
    });
  } catch (error) {
    console.error('Error checking article reset status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
