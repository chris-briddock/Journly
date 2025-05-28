"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";
import { useRecordReadingProgress } from "@/hooks/use-reading-history";

interface ReadingProgressTrackerProps {
  postId: string;
}

export function ReadingProgressTracker({ postId }: ReadingProgressTrackerProps) {
  const { data: session } = useSession();
  const [hasRecorded, setHasRecorded] = useState(false);

  // Use TanStack Query mutation
  const recordProgressMutation = useRecordReadingProgress();

  // Record reading progress to API
  const recordReadingProgress = useCallback((currentProgress: number, completed: boolean) => {
    if (!session?.user) return;

    recordProgressMutation.mutate({
      postId,
      progress: currentProgress,
      completed,
    });
  }, [session, postId, recordProgressMutation]);

  // Calculate reading progress
  useEffect(() => {
    if (!session?.user) return;

    let currentProgress = 0;

    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate how far the user has scrolled as a percentage
      currentProgress = Math.min(
        Math.round((scrollTop / (documentHeight - windowHeight)) * 100),
        100
      );

      // If user has read at least 70% of the post, record it as completed
      if (currentProgress >= 70 && !hasRecorded) {
        recordReadingProgress(currentProgress, true);
        setHasRecorded(true);
      } else if (currentProgress >= 30) {
        // Otherwise, periodically update progress
        recordReadingProgress(currentProgress, false);
      }
    };

    // Debounce to avoid too many API calls
    const debouncedCalculateProgress = debounce(calculateProgress, 1000);

    window.addEventListener("scroll", debouncedCalculateProgress);

    // Initial calculation
    calculateProgress();

    return () => {
      window.removeEventListener("scroll", debouncedCalculateProgress);
      debouncedCalculateProgress.cancel();

      // Record final progress when component unmounts
      if (currentProgress > 0) {
        recordReadingProgress(currentProgress, currentProgress >= 70);
      }
    };
  }, [session, postId, recordReadingProgress, hasRecorded]); // Include hasRecorded in dependencies

  // This component doesn't render anything visible
  return null;
}
