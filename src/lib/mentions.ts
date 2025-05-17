import prisma from '@/lib/prisma';
import { createMentionNotification } from './notifications';

/**
 * Extract mentions from text (format: @username)
 */
export function extractMentions(text: string): string[] {
  // Match @username pattern (alphanumeric and underscores, min 3 chars)
  const mentionRegex = /@([a-zA-Z0-9_]{3,})/g;
  const matches = text.match(mentionRegex);
  
  if (!matches) return [];
  
  // Remove @ symbol and return unique usernames
  return [...new Set(matches.map(match => match.substring(1)))];
}

/**
 * Process mentions in a post and create notifications
 */
export async function processPostMentions(
  postId: string, 
  postContent: string, 
  authorId: string,
  postTitle: string
): Promise<void> {
  const mentions = extractMentions(postContent);
  
  if (mentions.length === 0) return;
  
  // Find users by their usernames
  // Note: In a real system, you'd have a username field in the User model
  // For this implementation, we'll use the name field as a substitute
  const mentionedUsers = await prisma.user.findMany({
    where: {
      name: {
        in: mentions
      }
    },
    select: {
      id: true,
      name: true
    }
  });
  
  // Create notifications for each mentioned user
  for (const user of mentionedUsers) {
    // Don't notify the author if they mention themselves
    if (user.id === authorId) continue;
    
    await createMentionNotification({
      userId: user.id,
      actionUserId: authorId,
      postId,
      message: `You were mentioned in the post "${postTitle}"`,
      mentionedIn: 'post'
    });
  }
}

/**
 * Process mentions in a comment and create notifications
 */
export async function processCommentMentions(
  commentId: string,
  commentContent: string,
  authorId: string,
  postId: string,
  postTitle: string
): Promise<void> {
  const mentions = extractMentions(commentContent);
  
  if (mentions.length === 0) return;
  
  // Find users by their usernames
  const mentionedUsers = await prisma.user.findMany({
    where: {
      name: {
        in: mentions
      }
    },
    select: {
      id: true,
      name: true
    }
  });
  
  // Create notifications for each mentioned user
  for (const user of mentionedUsers) {
    // Don't notify the author if they mention themselves
    if (user.id === authorId) continue;
    
    await createMentionNotification({
      userId: user.id,
      actionUserId: authorId,
      postId,
      commentId,
      message: `You were mentioned in a comment on "${postTitle}"`,
      mentionedIn: 'comment'
    });
  }
}
