import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// POST /api/posts/bulk-delete - Bulk delete posts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to delete posts' },
        { status: 401 }
      );
    }

    const { postIds } = await request.json();

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Post IDs are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // First, verify that all posts exist and belong to the current user
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
      },
      select: {
        id: true,
        authorId: true,
        title: true,
      },
    });

    // Check if all posts were found
    if (posts.length !== postIds.length) {
      const foundIds = posts.map(p => p.id);
      const missingIds = postIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Posts not found: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Check if user owns all posts
    const unauthorizedPosts = posts.filter(post => post.authorId !== userId);
    if (unauthorizedPosts.length > 0) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Perform bulk deletion using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete related data first (comments, likes, bookmarks, etc.)
      await tx.comment.deleteMany({
        where: { postId: { in: postIds } },
      });

      await tx.like.deleteMany({
        where: { postId: { in: postIds } },
      });

      await tx.bookmark.deleteMany({
        where: { postId: { in: postIds } },
      });

      await tx.readingHistory.deleteMany({
        where: { postId: { in: postIds } },
      });

      await tx.notification.deleteMany({
        where: { postId: { in: postIds } },
      });

      await tx.articleAccess.deleteMany({
        where: { postId: { in: postIds } },
      });

      // Delete post categories
      await tx.postCategory.deleteMany({
        where: { postId: { in: postIds } },
      });

      // Finally, delete the posts
      const deleteResult = await tx.post.deleteMany({
        where: {
          id: { in: postIds },
          authorId: userId, // Extra safety check
        },
      });

      return deleteResult;
    });

    console.log(`Bulk deleted ${result.count} posts for user ${userId}`);

    return NextResponse.json({
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} post(s)`,
    });

  } catch (error) {
    console.error('Error in bulk delete posts:', error);
    return NextResponse.json(
      { error: 'Failed to delete posts. Please try again.' },
      { status: 500 }
    );
  }
}
