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
    const params = new URLSearchParams(searchParams);
    
    if (debouncedSearchQuery) {
      params.set("q", debouncedSearchQuery);
    } else {
      params.delete("q");
    }
    
    // Keep the current page and status
    const status = searchParams.get("status");
    if (status) {
      params.set("status", status);
    }
    
    // Reset to page 1 when searching
    params.set("page", "1");
    
    // Only update the URL if the query has changed
    if (debouncedSearchQuery !== searchParams.get("q")) {
      router.push(`${pathname}?${params.toString()}`);
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
