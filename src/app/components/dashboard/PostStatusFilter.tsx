"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export function PostStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";
  // We'll use the current page when resetting pagination
  // const currentPage = searchParams.get("page") || "1";

  const handleStatusChange = (value: string) => {
    // Create a new URLSearchParams instance
    const params = new URLSearchParams();

    // Update the status parameter
    if (value !== "all") {
      params.set("status", value);
    }

    // Reset to page 1 when changing filters
    params.set("page", "1");

    // Preserve search query if it exists
    const query = searchParams.get("q");
    if (query) {
      params.set("q", query);
    }

    // Navigate to the new URL with a hard navigation
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Posts</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Drafts</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
