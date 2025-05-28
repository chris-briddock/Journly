'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useScheduledPostsPoller } from '@/hooks/use-posts';

/**
 * Component that polls the scheduled posts endpoint to check for posts that need to be published
 * This is a client-side alternative to Vercel Cron jobs for the hobby tier
 */
export function ScheduledPostsPoller() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Only poll when user is authenticated and session is loaded
  const shouldPoll = status === 'authenticated' && !!session?.user?.id;

  // Use TanStack Query hook for polling (only when authenticated)
  const { data: scheduledPostsData, error } = useScheduledPostsPoller(shouldPoll);

  // Handle successful polling results
  useEffect(() => {
    if (scheduledPostsData && scheduledPostsData.publishedCount > 0) {
      toast.success(`${scheduledPostsData.publishedCount} scheduled post${scheduledPostsData.publishedCount === 1 ? '' : 's'} published`);

      // Refresh the page to show the updated posts
      router.refresh();
    }
  }, [scheduledPostsData, router]);

  // Handle errors (but don't show toast to avoid annoying the user)
  useEffect(() => {
    if (error && shouldPoll) {
      console.error('Error checking scheduled posts:', error);
      // Only log errors when we're actually supposed to be polling
    }
  }, [error, shouldPoll]);

  // This component doesn't render anything visible
  return null;
}
