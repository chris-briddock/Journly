import Link from "next/link";
import type { Metadata } from "next/types";
import { Layers3, ArrowRight, FileText } from "lucide-react";

import { getApiUrl } from "@/lib/getApiUrl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Category } from "@/types/models/category";

export const metadata: Metadata = {
  title: "Categories - Journly",
  description: "Browse all categories on Journly",
};

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(getApiUrl('/api/categories'), {
      next: { revalidate: 0 },
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status, response.statusText);
      return [];
    }

    // The API returns the categories directly, not wrapped in a data object
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">
              Browse all categories on Journly to find content that interests you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories && categories.length > 0 ? (
              categories.map((category: Category) => (
                <Card key={category.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layers3 className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      {category.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{category.postCount || 0} posts</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/posts?categoryId=${category.id}`}>
                        <span className="flex items-center gap-2">
                          Browse Posts <ArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground">No categories found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
