import prisma from '@/lib/prisma';

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'post_update' | 'comment_reply' | 'system' | 'new_post';

interface CreateNotificationParams {
  type: NotificationType;
  userId: string; // User receiving the notification
  actionUserId: string; // User who triggered the notification
  message: string;
  link?: string;
  postId?: string;
  commentId?: string;
  groupId?: string; // For grouping similar notifications
  data?: Record<string, unknown>; // Additional data as JSON
}

/**
 * Create a notification
 */
export async function createNotification({
  type,
  userId,
  actionUserId,
  message,
  link,
  postId,
  commentId,
  groupId,
  data,
}: CreateNotificationParams) {
  // Don't create notification if user is notifying themselves
  if (userId === actionUserId) {
    return null;
  }

  try {
    // Check user's notification preferences
    const preferences = await prisma.userNotificationPreferences.findUnique({
      where: { userId },
    });

    // If user has disabled this type of notification, don't create it
    if (preferences) {
      if (
        (type === 'like' && !preferences.newLikes) ||
        (type === 'comment' && !preferences.newComments) ||
        (type === 'follow' && !preferences.newFollowers) ||
        (type === 'post_update' && !preferences.postUpdates) ||
        (type === 'comment_reply' && !preferences.commentReplies) ||
        (type === 'new_post' && !preferences.newPostsFromFollowing)
      ) {
        return null;
      }

      // Handle mention notifications based on where the mention occurred
      if (type === 'mention') {
        const mentionData = data as Record<string, unknown> | undefined;
        const mentionedIn = mentionData?.mentionedIn as string;

        if (
          (mentionedIn === 'post' && !preferences.mentionsInPosts) ||
          (mentionedIn === 'comment' && !preferences.mentionsInComments) ||
          (!mentionedIn && !preferences.mentions)
        ) {
          return null;
        }
      }
    }

    // Check for similar recent notifications to group them
    let finalGroupId = groupId;
    if (!finalGroupId && (type === 'like' || type === 'follow')) {
      // For likes and follows, try to group by post or user
      const timeWindow = new Date();
      timeWindow.setHours(timeWindow.getHours() - 24); // Group within 24 hours

      const similarNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type,
          postId: postId || undefined,
          createdAt: { gte: timeWindow },
          read: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (similarNotification) {
        finalGroupId = similarNotification.groupId || similarNotification.id;
      }
    }

    // Convert data to JSON string if provided
    const jsonData = data ? JSON.stringify(data) : undefined;

    const notification = await prisma.notification.create({
      data: {
        type,
        userId,
        actionUserId,
        message,
        link,
        postId,
        commentId,
        groupId: finalGroupId,
        data: jsonData,
      },
    });

    // If this is a browser notification, send it if enabled
    if (preferences?.browserNotifications) {
      // This would be handled by a real-time system in production
      // For now, we'll just log it
      console.log('Would send browser notification:', message);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create a like notification
 */
export async function createLikeNotification({
  postId,
  actionUserId,
}: {
  postId: string;
  actionUserId: string;
}) {
  try {
    // Get post and author info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get action user name
    const actionUser = await prisma.user.findUnique({
      where: { id: actionUserId },
      select: { name: true },
    });

    if (!actionUser) {
      throw new Error('Action user not found');
    }

    const actionUserName = actionUser.name || 'Someone';
    const postTitle = post.title.length > 50
      ? `${post.title.substring(0, 50)}...`
      : post.title;

    return createNotification({
      type: 'like',
      userId: post.authorId,
      actionUserId,
      message: `${actionUserName} liked your post "${postTitle}"`,
      link: `/posts/${postId}`,
      postId,
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
    return null;
  }
}

/**
 * Create a comment notification
 */
export async function createCommentNotification({
  postId,
  commentId,
  actionUserId,
}: {
  postId: string;
  commentId: string;
  actionUserId: string;
}) {
  try {
    // Get post and author info
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get action user name
    const actionUser = await prisma.user.findUnique({
      where: { id: actionUserId },
      select: { name: true },
    });

    if (!actionUser) {
      throw new Error('Action user not found');
    }

    const actionUserName = actionUser.name || 'Someone';
    const postTitle = post.title.length > 50
      ? `${post.title.substring(0, 50)}...`
      : post.title;

    return createNotification({
      type: 'comment',
      userId: post.authorId,
      actionUserId,
      message: `${actionUserName} commented on your post "${postTitle}"`,
      link: `/posts/${postId}#comment-${commentId}`,
      postId,
      commentId,
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return null;
  }
}

/**
 * Create a follow notification
 */
export async function createFollowNotification({
  followerId,
  followingId,
}: {
  followerId: string;
  followingId: string;
}) {
  try {
    // Get follower name
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { name: true },
    });

    if (!follower) {
      throw new Error('Follower not found');
    }

    const followerName = follower.name || 'Someone';

    return createNotification({
      type: 'follow',
      userId: followingId,
      actionUserId: followerId,
      message: `${followerName} started following you`,
      link: `/profile/${followerId}`,
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
    return null;
  }
}

/**
 * Create a comment reply notification
 */
export async function createCommentReplyNotification({
  parentCommentId,
  replyCommentId,
  actionUserId,
}: {
  parentCommentId: string;
  replyCommentId: string;
  actionUserId: string;
}) {
  try {
    // Get parent comment and its author
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: {
        id: true,
        authorId: true,
        postId: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    // Get reply author name
    const replyAuthor = await prisma.user.findUnique({
      where: { id: actionUserId },
      select: { name: true },
    });

    if (!replyAuthor) {
      throw new Error('Reply author not found');
    }

    const replyAuthorName = replyAuthor.name || 'Someone';
    const postTitle = parentComment.post.title.length > 50
      ? `${parentComment.post.title.substring(0, 50)}...`
      : parentComment.post.title;

    return createNotification({
      type: 'comment_reply',
      userId: parentComment.authorId,
      actionUserId,
      message: `${replyAuthorName} replied to your comment on "${postTitle}"`,
      link: `/posts/${parentComment.postId}#comment-${replyCommentId}`,
      postId: parentComment.postId,
      commentId: replyCommentId,
      data: {
        parentCommentId,
        parentCommentAuthorId: parentComment.authorId,
      },
    });
  } catch (error) {
    console.error('Error creating comment reply notification:', error);
    return null;
  }
}

/**
 * Create a post update notification
 */
export async function createPostUpdateNotification({
  postId,
  actionUserId,
}: {
  postId: string;
  actionUserId: string;
}) {
  try {
    // Get post details
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get action user name
    const actionUser = await prisma.user.findUnique({
      where: { id: actionUserId },
      select: { name: true },
    });

    if (!actionUser) {
      throw new Error('Action user not found');
    }

    const actionUserName = actionUser.name || 'Someone';
    const postTitle = post.title.length > 50
      ? `${post.title.substring(0, 50)}...`
      : post.title;

    // TODO: In a real implementation, we would find all users who follow this post
    // For now, we'll just notify the post author
    return createNotification({
      type: 'post_update',
      userId: post.authorId,
      actionUserId,
      message: `${actionUserName} updated the post "${postTitle}"`,
      link: `/posts/${postId}`,
      postId,
    });
  } catch (error) {
    console.error('Error creating post update notification:', error);
    return null;
  }
}

/**
 * Create a mention notification
 */
export async function createMentionNotification({
  userId,
  actionUserId,
  postId,
  commentId,
  message,
  mentionedIn,
}: {
  userId: string;
  actionUserId: string;
  postId: string;
  commentId?: string;
  message: string;
  mentionedIn: 'post' | 'comment';
}) {
  try {
    // Get action user name
    const actionUser = await prisma.user.findUnique({
      where: { id: actionUserId },
      select: { name: true },
    });

    if (!actionUser) {
      throw new Error('Action user not found');
    }

    // Create the link based on where the mention occurred
    const link = commentId
      ? `/posts/${postId}#comment-${commentId}`
      : `/posts/${postId}`;

    return createNotification({
      type: 'mention',
      userId,
      actionUserId,
      message,
      link,
      postId,
      commentId,
      data: {
        mentionedIn,
      },
    });
  } catch (error) {
    console.error('Error creating mention notification:', error);
    return null;
  }
}

/**
 * Create a new post notification for followers
 */
export async function createNewPostNotification({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) {
  try {
    // Get post details
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Get author details
    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        name: true,
      },
    });

    if (!author) {
      throw new Error('Author not found');
    }

    // Get all followers of the author
    const followers = await prisma.follow.findMany({
      where: { followingId: authorId },
      select: { followerId: true },
    });

    const authorName = author.name || 'Someone';
    const postTitle = post.title.length > 50
      ? `${post.title.substring(0, 50)}...`
      : post.title;

    // Create notifications for each follower
    const notificationPromises = followers.map(follower =>
      createNotification({
        type: 'new_post',
        userId: follower.followerId,
        actionUserId: authorId,
        message: `${authorName} published a new post: "${postTitle}"`,
        link: `/posts/${postId}`,
        postId,
      })
    );

    await Promise.all(notificationPromises);
    return true;
  } catch (error) {
    console.error('Error creating new post notifications:', error);
    return null;
  }
}
