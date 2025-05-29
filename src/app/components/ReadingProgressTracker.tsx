"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { debounce } from "lodash";
import { recordReadingProgress as apiRecordReadingProgress } from "@/lib/api/reading-history";

interface ReadingProgressTrackerProps {
  postId: string;
}

export function ReadingProgressTracker({ postId }: ReadingProgressTrackerProps) {
  const { data: session } = useSession();
  const [hasRecorded, setHasRecorded] = useState(false);
  const currentProgressRef = useRef(0);
  const hasRecordedRef = useRef(false);
  const sessionRef = useRef(session);

  // Update refs when values change
  useEffect(() => {
    hasRecordedRef.current = hasRecorded;
  }, [hasRecorded]);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Calculate reading progress
  useEffect(() => {
    if (!session?.user?.id) return;

    const recordProgress = async (progress: number, completed: boolean) => {
      try {
        await apiRecordReadingProgress(postId, progress, completed);
      } catch (error) {
        console.error('Failed to record reading progress:', error);
      }
    };

    const calculateProgress = () => {
      // Check if user is still logged in
      if (!sessionRef.current?.user?.id) return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate how far the user has scrolled as a percentage
      const progress = Math.min(
        Math.round((scrollTop / (documentHeight - windowHeight)) * 100),
        100
      );

      currentProgressRef.current = progress;

      // If user has read at least 70% of the post, record it as completed
      if (progress >= 70 && !hasRecordedRef.current) {
        recordProgress(progress, true);
        setHasRecorded(true);
      } else if (progress >= 30) {
        // Otherwise, periodically update progress
        recordProgress(progress, false);
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
      if (currentProgressRef.current > 0 && sessionRef.current?.user?.id) {
        recordProgress(currentProgressRef.current, currentProgressRef.current >= 70);
      }
    };
  }, [session?.user?.id, postId]); // Minimal, stable dependencies

  // This component doesn't render anything visible
  return null;
}
