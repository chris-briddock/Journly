"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useIsFollowing, useToggleUserFollow } from "@/hooks/use-users";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FollowButton({
  userId,
  isFollowing,
  variant = "default",
  size = "default"
}: FollowButtonProps) {
  const { data: session } = useSession();

  // Use TanStack Query hooks
  const {
    data: followStatus,
    isLoading: isCheckingStatus
  } = useIsFollowing(userId, !!session?.user);

  const toggleFollowMutation = useToggleUserFollow();

  // Determine follow status from query data or fallback to prop
  const following = followStatus?.isFollowing ?? isFollowing;
  const isLoading = isCheckingStatus || toggleFollowMutation.isPending;

  // Update local state when prop changes (for SSR compatibility)
  useEffect(() => {
    // This effect ensures the component works with SSR initial data
    // The query will update the state once it loads
  }, [isFollowing]);

  const handleFollow = () => {
    if (!session || !session.user) {
      // Note: Toast is handled by the mutation hook
      return;
    }

    if (session.user.id === userId) {
      // Note: This validation could be moved to the mutation hook
      return;
    }

    toggleFollowMutation.mutate(userId);
  };

  return (
    <Button
      variant={following ? "outline" : variant}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {following ? "Unfollowing..." : "Following..."}
        </>
      ) : following ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
