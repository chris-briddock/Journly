"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { getInitials } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    read: boolean;
    message: string;
    link: string | null;
    createdAt: Date;
    actionUser: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    post?: {
      id: string;
      title: string;
    } | null;
    comment?: {
      id: string;
      content: string;
      postId: string;
    } | null;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [, setIsLoading] = useState(false);
  const [isRead, setIsRead] = useState(notification.read);

  const handleMarkAsRead = async () => {
    if (isRead) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
        body: JSON.stringify({ ids: [notification.id] }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setIsRead(true);
      router.refresh();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    // Mark as read first
    if (!isRead) {
      await handleMarkAsRead();
    }

    // Navigate to the appropriate page based on notification type
    if (notification.link) {
      router.push(notification.link);
    } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'mention') {
      // If it's a post-related notification and we have a post ID
      if (notification.post?.id) {
        router.push(`/posts/${notification.post.id}`);
      } else if (notification.comment?.postId) {
        // If it's a comment-related notification and we have a post ID from the comment
        router.push(`/posts/${notification.comment.postId}#comment-${notification.comment.id}`);
      }
    } else if (notification.type === 'follow') {
      // If it's a follow notification, go to the follower's profile
      if (notification.actionUser?.id) {
        router.push(`/profile/${notification.actionUser.id}`);
      }
    }
  };

  return (
    <div
      className={`flex items-start gap-4 p-3 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors border border-transparent hover:border-border ${
        !isRead ? "bg-muted/50" : ""
      }`}
      onClick={handleClick}
    >
      {notification.actionUser ? (
        <Avatar>
          <AvatarImage
            src={notification.actionUser.image || undefined}
            alt={notification.actionUser.name || "User"}
          />
          <AvatarFallback>
            {getInitials(notification.actionUser.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar>
          <AvatarFallback>SYS</AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        <p>{notification.message}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={(e) => {
        e.stopPropagation();

        // Navigate to the appropriate page based on notification type
        if (notification.link) {
          router.push(notification.link);
        } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'mention') {
          // If it's a post-related notification and we have a post ID
          if (notification.post?.id) {
            router.push(`/posts/${notification.post.id}`);
          } else if (notification.comment?.postId) {
            // If it's a comment-related notification and we have a post ID from the comment
            router.push(`/posts/${notification.comment.postId}#comment-${notification.comment.id}`);
          }
        } else if (notification.type === 'follow') {
          // If it's a follow notification, go to the follower's profile
          if (notification.actionUser?.id) {
            router.push(`/profile/${notification.actionUser.id}`);
          }
        }

        // Mark as read if not already read
        if (!isRead) {
          handleMarkAsRead();
        }
      }}>
        View
      </Button>
    </div>
  );
}
