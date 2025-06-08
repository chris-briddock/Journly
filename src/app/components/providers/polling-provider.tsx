'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';
import { useScheduledPostsPoller } from '@/hooks/use-posts';
import { useArticleResetStatus, useResetArticleCount } from '@/hooks/use-users';

/**
 * Unified polling provider that handles both scheduled posts and article resets
 * This component is placed at the root level to avoid hook order issues during navigation
 */
export function PollingProvider() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Only poll when user is authenticated and session is loaded
  const shouldPoll = status === 'authenticated' && !!session?.user?.id;

  // Scheduled posts polling
  const { data: scheduledPostsData, error: scheduledPostsError } = useScheduledPostsPoller(shouldPoll);

  // Article reset polling
  const { data: resetStatusData, error: resetStatusError } = useArticleResetStatus(shouldPoll);
  const resetArticleCountMutation = useResetArticleCount();

  // Handle scheduled posts results
  useEffect(() => {
    if (scheduledPostsData && scheduledPostsData.publishedCount > 0) {
      toast.success(
        `${scheduledPostsData.publishedCount} scheduled post${
          scheduledPostsData.publishedCount === 1 ? '' : 's'
        } published`
      );

      // Refresh the page to show the updated posts
      router.refresh();
    }
  }, [scheduledPostsData, router]);

  // Handle scheduled posts errors (but don't show toast to avoid annoying the user)
  useEffect(() => {
    if (scheduledPostsError && shouldPoll) {
      console.error('Error checking scheduled posts:', scheduledPostsError);
    }
  }, [scheduledPostsError, shouldPoll]);

  // Handle article reset logic
  useEffect(() => {
    // Only run for authenticated users
    if (!session?.user?.id || !resetStatusData) return;

    try {
      // If the last reset date is before the start of the current month, reset the counts
      const startOfCurrentMonth = startOfMonth(new Date());
      const lastResetDate = resetStatusData.lastArticleResetDate
        ? new Date(resetStatusData.lastArticleResetDate)
        : null;

      console.log('Last article reset date:', lastResetDate);
      console.log('Start of current month:', startOfCurrentMonth);

      if (!lastResetDate || isAfter(startOfCurrentMonth, lastResetDate)) {
        // Reset the user's article count using the mutation
        resetArticleCountMutation.mutate();
      }
    } catch (error) {
      console.error('Error processing article reset:', error);
    }
  }, [session?.user?.id, resetStatusData, resetArticleCountMutation]);

  // Handle article reset errors
  useEffect(() => {
    if (resetStatusError && shouldPoll) {
      console.error('Error checking article reset status:', resetStatusError);
    }
  }, [resetStatusError, shouldPoll]);

  // This component doesn't render anything visible
  return null;
}
