'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ScheduledPostsResponse {
  success: boolean;
  message: string;
  publishedCount: number;
  publishedPostIds?: string[];
}

/**
 * Component that polls the scheduled posts endpoint to check for posts that need to be published
 * This is a client-side alternative to Vercel Cron jobs for the hobby tier
 */
export function ScheduledPostsPoller() {
  const router = useRouter();
  const [isPolling, setIsPolling] = useState(false);

  // Function to check for scheduled posts
  const checkScheduledPosts = async () => {
    if (isPolling) return; // Prevent multiple simultaneous requests

    try {
      setIsPolling(true);

      // Call the publish-scheduled endpoint
      const response = await fetch('/api/cron/publish-scheduled', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to check scheduled posts');
      }

      const data = await response.json() as ScheduledPostsResponse;

      // If posts were published, show a toast and refresh the page
      if (data.publishedCount > 0) {
        toast.success(`${data.publishedCount} scheduled post${data.publishedCount === 1 ? '' : 's'} published`);

        // Refresh the page to show the updated posts
        router.refresh();
      }
    } catch (error: unknown) {
      console.error('Error checking scheduled posts:', error);
      // Don't show an error toast to avoid annoying the user
    } finally {
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Check immediately on component mount
    checkScheduledPosts();

    // Set up polling interval (every 60 seconds)
    const interval = setInterval(checkScheduledPosts, 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This component doesn't render anything visible
  return null;
}
