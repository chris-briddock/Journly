'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useScheduledPostsPoller } from '@/hooks/use-posts';

/**
 * Component that checks for scheduled posts that need to be published
 * This is a client-side solution for environments where cron jobs aren't available
 */
export function ScheduledPostsCheck() {
  const { data: session, status } = useSession();

  // Only poll when user is authenticated and session is loaded
  const shouldPoll = status === 'authenticated' && !!session?.user?.id;

  // Use TanStack Query hook for polling (only for authenticated users)
  const { error } = useScheduledPostsPoller(shouldPoll);

  // Handle errors
  useEffect(() => {
    if (error && shouldPoll) {
      console.error('Error checking scheduled posts:', error);
      // Only log errors when we're actually supposed to be polling
    }
  }, [error, shouldPoll]);

  // This component doesn't render anything
  return null;
}
