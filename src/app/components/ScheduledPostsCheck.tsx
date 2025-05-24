'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Component that checks for scheduled posts that need to be published
 * This is a client-side solution for environments where cron jobs aren't available
 */
export function ScheduledPostsCheck() {
  const { data: session } = useSession();

  useEffect(() => {
    // Only run for authenticated users
    if (!session?.user?.id) return;

    const checkScheduledPosts = async () => {
      try {
        // Call the API to publish scheduled posts
        await fetch('/api/cron/publish-scheduled');
      } catch (error) {
        console.error('Error checking scheduled posts:', error);
      }
    };

    // Run the check when the component mounts
    checkScheduledPosts();

    // Set up an interval to check every 5 minutes
    // This is a reasonable interval that won't overload the server
    // but will still ensure posts are published relatively close to their scheduled time
    const interval = setInterval(checkScheduledPosts, 5 * 60 * 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [session]);

  // This component doesn't render anything
  return null;
}
