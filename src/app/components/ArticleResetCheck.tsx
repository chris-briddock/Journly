'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { startOfMonth, isAfter } from 'date-fns';

/**
 * Component that checks if article counts need to be reset
 * This is a client-side solution for environments where cron jobs aren't available
 */
export function ArticleResetCheck() {
  const { data: session } = useSession();

  useEffect(() => {
    // Only run for authenticated users
    if (!session?.user?.id) return;

    const checkAndResetArticleCounts = async () => {
      try {
        // Get the user's last reset date
        const response = await fetch('/api/users/article-reset-check');
        
        if (!response.ok) {
          console.error('Failed to check article reset status');
          return;
        }

        const data = await response.json();
        
        // If the last reset date is before the start of the current month, reset the counts
        const startOfCurrentMonth = startOfMonth(new Date());
        const lastResetDate = data.lastArticleResetDate ? new Date(data.lastArticleResetDate) : null;
        
        if (!lastResetDate || isAfter(startOfCurrentMonth, lastResetDate)) {
          // Reset the user's article count
          await fetch('/api/users/reset-article-count', {
            method: 'POST',
          });
        }
      } catch (error) {
        console.error('Error checking article reset status:', error);
      }
    };

    // Run the check when the component mounts
    checkAndResetArticleCounts();
  }, [session]);

  // This component doesn't render anything
  return null;
}
