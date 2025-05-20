import { getApiUrl } from "../getApiUrl";

/**
 * Schedule a post for publishing
 * @param postId The ID of the post to schedule
 * @param publishAt The date and time to publish the post
 * @returns The scheduled post
 */
export async function schedulePost(postId: string, publishAt: Date) {
  const response = await fetch(getApiUrl('/api/posts/schedule'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postId, publishAt }),
    next: { revalidate: 0 },
    credentials: 'include' // Include credentials (cookies) for authentication
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to schedule post');
  }

  return response.json();
}
