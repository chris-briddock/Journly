"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useTogglePostLike } from "@/hooks/use-posts";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  isLiked?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LikeButton({
  postId,
  initialLikeCount,
  isLiked = false,
  variant = "ghost",
  size = "sm"
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Use TanStack Query mutation
  const toggleLikeMutation = useTogglePostLike();

  const handleLike = () => {
    if (!session || !session.user) {
      // Note: We could show a toast here, but the mutation hook handles error messages
      return;
    }

    // Optimistically update local state for immediate feedback
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    // Trigger the mutation
    toggleLikeMutation.mutate(postId, {
      onSuccess: (result) => {
        // Update with actual values from API
        setLiked(result.liked);
        setLikeCount(result.likesCount);
      },
      onError: () => {
        // Rollback optimistic update on error
        setLiked(!newLiked);
        setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
      }
    });
  };

  const isLoading = toggleLikeMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-1"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${liked ? "fill-current text-red-500" : ""}`} />
      )}
      <span>{likeCount}</span>
    </Button>
  );
}
