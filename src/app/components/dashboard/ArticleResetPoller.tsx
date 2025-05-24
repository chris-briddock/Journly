'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';

/**
 * Component that polls for article count resets at the beginning of each month
 * This is a client-side alternative to Vercel Cron jobs for the hobby tier
 */
export function ArticleResetPoller() {
  const { data: session } = useSession();

  // Function to check if article counts need to be reset
  const checkArticleReset = async () => {
    // Only run for authenticated users
    if (!session?.user?.id) return;

    try {
      // Get the user's last reset date
      const response = await fetch('/api/users/article-reset-check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('Failed to check article reset status');
        return;
      }

      const data = await response.json();

      // If the last reset date is before the start of the current month, reset the counts
      const startOfCurrentMonth = startOfMonth(new Date());
      const lastResetDate = data.lastArticleResetDate ? new Date(data.lastArticleResetDate) : null;

      console.log('Last article reset date:', lastResetDate);
      console.log('Start of current month:', startOfCurrentMonth);

      if (!lastResetDate || isAfter(startOfCurrentMonth, lastResetDate)) {
        // Reset the user's article count
        await fetch('/api/users/reset-article-count', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        console.log('Article count reset successfully');
      }
    } catch (error) {
      console.error('Error checking article reset status:', error);
    }
  };

  useEffect(() => {
    // Check immediately on component mount
    checkArticleReset();

    // Set up polling interval (once per day is sufficient for this use case)
    // This ensures that if a user visits the site at the beginning of a month,
    // their article count will be reset
    const interval = setInterval(checkArticleReset, 24 * 60 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // This component doesn't render anything visible
  return null;
}
