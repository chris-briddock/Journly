import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Force Node.js runtime for consistency with other user routes
export const runtime = 'nodejs';

// GET /api/user/notification-preferences - Get user notification preferences
export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view notification preferences' },
        { status: 401 }
      );
    }

    const userId = session.user.id as string;

    // Get user's notification preferences
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId }
    });

    // If no preferences exist yet, return default values
    if (!preferences) {
      return NextResponse.json({
        emailNotifications: true,
        browserNotifications: false,
        newComments: true,
        newLikes: true,
        newFollowers: true,
        mentions: true,
        newsletter: false,
        marketingEmails: false,
        postUpdates: true,
        commentReplies: true,
        newPostsFromFollowing: true,
        mentionsInPosts: true,
        mentionsInComments: true
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

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

    const userId = session.user.id as string;
    const preferences = await request.json();

    // Validate preferences
    const validPreferences = {
      emailNotifications: Boolean(preferences.emailNotifications),
      browserNotifications: Boolean(preferences.browserNotifications),
      newComments: Boolean(preferences.newComments),
      newLikes: Boolean(preferences.newLikes),
      newFollowers: Boolean(preferences.newFollowers),
      mentions: Boolean(preferences.mentions),
      newsletter: Boolean(preferences.newsletter),
      marketingEmails: Boolean(preferences.marketingEmails),
      postUpdates: Boolean(preferences.postUpdates),
      commentReplies: Boolean(preferences.commentReplies),
      newPostsFromFollowing: Boolean(preferences.newPostsFromFollowing),
      mentionsInPosts: Boolean(preferences.mentionsInPosts),
      mentionsInComments: Boolean(preferences.mentionsInComments)
    };

    // Update or create notification preferences
    const updatedPreferences = await prisma.userNotificationPreferences.upsert({
      where: { userId },
      update: validPreferences,
      create: {
        userId,
        ...validPreferences
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
