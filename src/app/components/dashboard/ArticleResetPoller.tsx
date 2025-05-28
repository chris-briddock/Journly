'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';
import { useArticleResetStatus, useResetArticleCount } from '@/hooks/use-users';

/**
 * Component that polls for article count resets at the beginning of each month
 * This is a client-side alternative to Vercel Cron jobs for the hobby tier
 * Now uses TanStack Query for better caching and error handling
 */
export function ArticleResetPoller() {
  const { data: session } = useSession();

  // Use TanStack Query hooks for article reset functionality
  const { data: resetStatusData, error: resetStatusError } = useArticleResetStatus(!!session?.user?.id);
  const resetArticleCountMutation = useResetArticleCount();

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

  // Log any errors from the reset status query
  useEffect(() => {
    if (resetStatusError) {
      console.error('Error checking article reset status:', resetStatusError);
    }
  }, [resetStatusError]);

  // This component doesn't render anything visible
  return null;
}
