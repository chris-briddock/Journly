"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

import { Input } from "../../components/ui/input";

export function PostSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    // Only proceed if the search query has actually changed
    if (debouncedSearchQuery !== searchParams.get("q")) {
      const params = new URLSearchParams();

      // Add search query if it exists
      if (debouncedSearchQuery) {
        params.set("q", debouncedSearchQuery);
      }

      // Keep the current status
      const status = searchParams.get("status");
      if (status) {
        params.set("status", status);
      }

      // Reset to page 1 only when the search query changes
      params.set("page", "1");

      // Use router.replace instead of push to avoid adding to history stack
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchQuery, router, pathname, searchParams]);

  return (
    <div className="relative w-full md:w-auto">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search posts..."
        className="w-full md:w-[200px] pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
