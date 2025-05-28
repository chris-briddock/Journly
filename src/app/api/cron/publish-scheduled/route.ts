import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNewPostNotification } from '@/lib/notifications';
import { processPostMentions } from '@/lib/mentions';

// Force Node.js runtime for notification service compatibility
export const runtime = 'nodejs';

// This route would be called by a cron job every few minutes
// to publish scheduled posts that are due

export async function GET() {
  try {
    // Get current time
    const now = new Date();

    // Find all scheduled posts that are due for publishing
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledPublishAt: {
          lte: now, // Less than or equal to current time
        },
      },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
      },
    });

    if (scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled posts due for publishing',
        publishedCount: 0,
      });
    }

    // Publish each scheduled post
    const publishPromises = scheduledPosts.map(async (post) => {
      // Update post status to published
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'published',
          publishedAt: now,
          scheduledPublishAt: null, // Clear the scheduled date
        },
      });

      // Process mentions in the post
      await processPostMentions(
        post.id,
        post.content,
        post.authorId,
        post.title
      );

      // Create notifications for followers
      await createNewPostNotification({
        postId: post.id,
        authorId: post.authorId,
      });

      return post.id;
    });

    const publishedPostIds = await Promise.all(publishPromises);

    return NextResponse.json({
      success: true,
      message: `Published ${publishedPostIds.length} scheduled posts`,
      publishedCount: publishedPostIds.length,
      publishedPostIds,
    });
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts' },
      { status: 500 }
    );
  }
}
