import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { auth } from "@/lib/auth";
import { getApiUrl } from "@/lib/getApiUrl";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import PostForm from "@/app/components/PostForm";

interface Category {
  id: string;
  name: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    // Add a dashboard parameter to indicate this is a dashboard request
    const url = getApiUrl('/api/categories/editor?dashboard=true');
    console.log('Fetching categories with URL:', url);

    const response = await fetch(url, {
      // Use next.js cache instead of no-store to allow static rendering
      // This will be revalidated when categories are updated
      next: { revalidate: 0 }, // Revalidate every 60 seconds
      credentials: 'include', // Include credentials (cookies) for authentication
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Categories fetch response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Categories API error response:', errorText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function NewPostPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/dashboard/posts">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Posts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create Post</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Information</CardTitle>
            <CardDescription>
              Fill in the details below to create a new post
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PostForm categories={categories} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
