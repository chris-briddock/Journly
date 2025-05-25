"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function BookmarkButton({
  postId,
  initialBookmarked = false,
  variant = "ghost",
  size = "sm",
  showText = false,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const checkBookmarkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/bookmark-status`);
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  }, [postId]);

  // Check if post is bookmarked on component mount
  useEffect(() => {
    if (session?.user) {
      checkBookmarkStatus();
    }
  }, [session, postId, checkBookmarkStatus]);

  const handleBookmark = async () => {
    if (!session?.user) {
      toast.error("Please sign in to bookmark posts");
      return;
    }

    setIsLoading(true);

    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method,
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
        toast.success(
          isBookmarked ? "Bookmark removed" : "Post bookmarked"
        );
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update bookmark");
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error("Failed to update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBookmark}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
      )}
    </Button>
  );
}
