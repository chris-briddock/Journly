"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

import { Button } from "@/app/components/ui/button";

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
  const router = useRouter();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session || !session.user) {
      toast.error("You must be logged in to like posts");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to like post");
      }

      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      toast.success(liked ? "Post unliked" : "Post liked");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
