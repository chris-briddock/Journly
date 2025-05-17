"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, UserPlus, UserMinus } from "lucide-react";

import { Button } from "@/app/components/ui/button";

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
  const router = useRouter();
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Use useEffect to update the local state when the prop changes
  useEffect(() => {
    setFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollow = async () => {
    if (!session || !session.user) {
      toast.error("You must be logged in to follow users");
      return;
    }

    if (session.user.id === userId) {
      toast.error("You cannot follow yourself");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to follow user");
      }

      setFollowing(data.following);
      toast.success(data.following ? "User followed successfully" : "User unfollowed successfully");
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
