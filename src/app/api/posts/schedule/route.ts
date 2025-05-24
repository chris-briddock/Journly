import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createNewPostNotification } from '@/lib/notifications';
import { processPostMentions } from '@/lib/mentions';

// POST /api/posts/schedule - Schedule a post for publishing
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to schedule a post' },
        { status: 401 }
      );
    }

    const { postId, publishAt } = await request.json();

    if (!postId || !publishAt) {
      return NextResponse.json(
        { error: 'Post ID and publish date are required' },
        { status: 400 }
      );
    }

    // Validate that publishAt is a future date
    const publishDate = new Date(publishAt);
    const now = new Date();

    if (publishDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled publish date must be in the future' },
        { status: 400 }
      );
    }

    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
        status: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only schedule your own posts' },
        { status: 403 }
      );
    }

    // Update the post with scheduled publish date
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        scheduledPublishAt: publishDate,
        status: 'scheduled', // Add a new status for scheduled posts
      },
    });

    // Process mentions in the post content (for future notifications when published)
    await processPostMentions(
      postId,
      post.content,
      session.user.id,
      post.title,
      true // This flag indicates it's a scheduled post, so don't send notifications yet
    );

    // Create a notification about the scheduled post (optional)
    await createNewPostNotification({
      postId,
      authorId: session.user.id,
      scheduled: true,
      scheduledDate: publishDate
    });

    return NextResponse.json({
      success: true,
      message: 'Post scheduled for publishing',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

// GET /api/posts/schedule - Get scheduled posts for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to view scheduled posts' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get scheduled posts for the current user
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: userId,
          status: 'scheduled',
          scheduledPublishAt: { not: null },
        },
        orderBy: {
          scheduledPublishAt: 'asc', // Sort by scheduled date
        },
        skip,
        take: limit,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.post.count({
        where: {
          authorId: userId,
          status: 'scheduled',
          scheduledPublishAt: { not: null },
        },
      }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  }
}
