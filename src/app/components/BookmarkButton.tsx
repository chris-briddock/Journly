"use client";

import { Button } from "@/app/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePostBookmarkStatus, useTogglePostBookmark } from "@/hooks/use-posts";

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

  // Use TanStack Query hooks
  const {
    data: bookmarkStatus,
    isLoading: isCheckingStatus
  } = usePostBookmarkStatus(postId, !!session?.user);

  const toggleBookmarkMutation = useTogglePostBookmark();

  // Determine bookmark status from query data or fallback to initial prop
  const isBookmarked = bookmarkStatus?.bookmarked ?? initialBookmarked;
  const isLoading = isCheckingStatus || toggleBookmarkMutation.isPending;

  const handleBookmark = () => {
    if (!session?.user) {
      // Note: toast is handled by the mutation hook
      return;
    }

    toggleBookmarkMutation.mutate(postId);
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
