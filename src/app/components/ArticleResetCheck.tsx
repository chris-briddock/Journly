'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';
import { useArticleResetStatus, useResetArticleCount } from '@/hooks/use-users';

/**
 * Component that checks if article counts need to be reset
 * This is a client-side solution for environments where cron jobs aren't available
 */
export function ArticleResetCheck() {
  const { data: session } = useSession();

  // Use TanStack Query hooks
  const { data: resetStatusData, error: resetStatusError } = useArticleResetStatus(!!session?.user?.id);
  const resetArticleCountMutation = useResetArticleCount();

  useEffect(() => {
    // Only run for authenticated users
    if (!session?.user?.id || !resetStatusData) return;

    // If the last reset date is before the start of the current month, reset the counts
    const startOfCurrentMonth = startOfMonth(new Date());
    const lastResetDate = resetStatusData.lastArticleResetDate ? new Date(resetStatusData.lastArticleResetDate) : null;

    if (!lastResetDate || isAfter(startOfCurrentMonth, lastResetDate)) {
      // Reset the user's article count
      resetArticleCountMutation.mutate();
    }
  }, [session, resetStatusData, resetArticleCountMutation]);

  // Handle errors
  useEffect(() => {
    if (resetStatusError) {
      console.error('Error checking article reset status:', resetStatusError);
    }
  }, [resetStatusError]);

  // This component doesn't render anything
  return null;
}
