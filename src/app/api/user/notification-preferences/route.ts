import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST /api/user/notification-preferences - Save user notification preferences
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to update notification preferences' },
        { status: 401 }
      );
    }

    // We'll use userId in a real implementation
    // const userId = session.user.id;
    const preferences = await request.json();

    // TODO: Create a new model for user notification preferences
    // await prisma.userNotificationPreferences.upsert({
    //   where: { userId },
    //   update: preferences,
    //   create: {
    //     userId,
    //     ...preferences
    //   }
    // });

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
