"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useMarkNotificationsAsRead } from "@/hooks/use-notifications";

export function MarkAllReadButton() {
  const markAsReadMutation = useMarkNotificationsAsRead();

  const handleMarkAllRead = () => {
    // Mark all notifications as read (undefined means mark all)
    markAsReadMutation.mutate(undefined);
  };

  const isLoading = markAsReadMutation.isPending;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleMarkAllRead}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Marking as read...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </>
      )}
    </Button>
  );
}
