"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";

interface ReadingProgressTrackerProps {
  postId: string;
}

export function ReadingProgressTracker({ postId }: ReadingProgressTrackerProps) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Record reading progress to API
  const recordReadingProgress = useCallback(async (currentProgress: number, completed: boolean) => {
    if (!session?.user) return;
    
    try {
      await fetch("/api/reading-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
        body: JSON.stringify({
          postId,
          progress: currentProgress,
          completed,
        }),
      });
    } catch (error) {
      console.error("Error recording reading progress:", error);
    }
  }, [session, postId]);

  // Calculate reading progress
  useEffect(() => {
    if (!session?.user) return;

    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate how far the user has scrolled as a percentage
      const currentProgress = Math.min(
        Math.round((scrollTop / (documentHeight - windowHeight)) * 100),
        100
      );
      
      setProgress(currentProgress);
      
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
      if (progress > 0) {
        recordReadingProgress(progress, progress >= 70);
      }
    };
  }, [session, postId, progress, hasRecorded, recordReadingProgress]);

  // This component doesn't render anything visible
  return null;
}
