"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";

export function MarkAllReadButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
        body: JSON.stringify({ all: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      toast.success("All notifications marked as read");
      router.refresh();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    } finally {
      setIsLoading(false);
    }
  };

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
