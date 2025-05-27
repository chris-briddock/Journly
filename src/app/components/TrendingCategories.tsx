"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { TrendingUp, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import { useTrendingCategories } from "@/hooks/use-categories";





interface TrendingCategoriesProps {
  limit?: number;
  showHeader?: boolean;
  variant?: "default" | "compact";
}

export function TrendingCategories({
  limit = 5,
  showHeader = true,
  variant = "default",
}: TrendingCategoriesProps) {
  const { data: categories = [], isLoading } = useTrendingCategories(limit);

  // For now, we'll use a static period since the API response structure might be different
  const period = "7 days";


  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Categories
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Categories
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-6">
            <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No trending categories yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {showHeader && (
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Categories
          </h3>
        )}
        <div className="flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <Link key={category.id} href={`/posts?categoryId=${category.id}`}>
              <Badge
                variant="secondary"
                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
              >
                #{index + 1} {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Categories
            <Badge variant="outline" className="ml-auto">
              Last {period}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <Link
                    href={`/posts?categoryId=${category.id}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Trending category</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/posts?categoryId=${category.id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {categories.length >= limit && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/posts">
                View All Categories
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
