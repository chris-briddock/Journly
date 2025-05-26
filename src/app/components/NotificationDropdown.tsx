"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { getApiUrl } from "@/lib/getApiUrl";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  message: string;
  link: string | null;
  createdAt: string;
  groupId: string | null;
  data: string | Record<string, unknown> | null; // Can be a string, parsed object, or null
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
  _count?: {
    groupedNotifications?: number;
  };
}

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl("/api/notifications?limit=10&grouped=true"), {
        next: { revalidate: 0 }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      // Process notifications to handle grouped ones
      const processedNotifications = data.notifications.map((notification: Notification) => {
        // If this notification has grouped notifications, update the message
        if (notification._count?.groupedNotifications && notification._count.groupedNotifications > 0) {
          // For likes, follows, etc.
          if (notification.type === 'like') {
            notification.message = `${notification.actionUser?.name || 'Someone'} and ${notification._count.groupedNotifications} others liked your post`;
          } else if (notification.type === 'follow') {
            notification.message = `${notification.actionUser?.name || 'Someone'} and ${notification._count.groupedNotifications} others started following you`;
          }
        }

        // Parse JSON data if present and it's a string
        if (notification.data && typeof notification.data === 'string') {
          try {
            const parsedData = JSON.parse(notification.data);
            notification.data = parsedData;
          } catch (e) {
            console.error('Error parsing notification data:', e);
          }
        }

        return notification;
      });

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notifications as read
  const markAsRead = useCallback(async (ids?: string[]) => {
    try {
      const response = await fetch(getApiUrl("/api/notifications"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
        body: JSON.stringify(ids ? { ids } : { all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      // Update local state
      if (ids) {
        setNotifications(
          notifications.map((notification) =>
            ids.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(Math.max(0, unreadCount - ids.length));
      } else {
        setNotifications(
          notifications.map((notification) => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  }, [notifications, unreadCount]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead([notification.id]);
    }

    // Navigate to the appropriate page based on notification type
    if (notification.link) {
      router.push(notification.link);
    } else {
      // Determine where to navigate based on notification type
      switch (notification.type) {
        case 'like':
        case 'comment':
        case 'mention':
        case 'post_update':
          // For post-related notifications
          if (notification.post) {
            router.push(`/posts/${notification.post.id}`);
          } else if (notification.data && typeof notification.data === 'object' && 'postId' in notification.data) {
            router.push(`/posts/${notification.data.postId}`);
          }
          break;
        case 'comment_reply':
          // For comment replies, navigate to the post with comment fragment
          if (notification.comment) {
            router.push(`/posts/${notification.comment.postId}#comment-${notification.comment.id}`);
          }
          break;
        case 'follow':
          // For follow notifications, go to the follower's profile
          if (notification.actionUser) {
            router.push(`/profile/${notification.actionUser.id}`);
          }
          break;
        default:
          // For other types, just close the dropdown
          break;
      }
    }

    setIsOpen(false);
  };

  // Fetch notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute

    return () => clearInterval(interval);
  }, []);

  // Mark all as read when dropdown opens
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      // Get IDs of unread notifications
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);

      if (unreadIds.length > 0) {
        markAsRead(unreadIds);
      }
    }
  }, [isOpen, unreadCount, notifications, markAsRead]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => router.push("/notifications")}
          >
            View all
          </Button>
        </div>
        <DropdownMenuSeparator />

        {isLoading ? (
          // Loading state
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          // Notifications list
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {notification.actionUser ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={notification.actionUser.image || undefined}
                        alt={notification.actionUser.name || "User"}
                      />
                      <AvatarFallback>
                        {getInitials(notification.actionUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SYS</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
