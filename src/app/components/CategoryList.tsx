"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

type Category = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  postCount: number;
  createdById: string;
};

type CategoryListProps = {
  categories: Category[];
  userId: string;
};

export default function CategoryList({ categories, userId }: CategoryListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  const handleDelete = async (categoryId: string) => {
    setIsDeleting(categoryId);
    setError(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      setLocalCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      toast.success("Category deleted successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive mb-4">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {localCategories.length === 0 ? (
        <div className="text-center py-6">
          <h3 className="text-lg font-medium mb-2">No categories yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first category to organize your posts
          </p>
          <Button asChild>
            <Link href="/dashboard/categories/new">Create Category</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y">
          {localCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between py-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{category.name}</h3>
                  {category.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Posts: {category.postCount}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/dashboard/categories/edit/${category.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                {!category.isDefault && category.createdById === userId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the category &quot;{category.name}&quot;.
                          {category.postCount > 0 && (
                            <span className="font-semibold block mt-2">
                              Note: This category has {category.postCount} posts. You cannot delete a category that has posts.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(category.id);
                          }}
                          disabled={isDeleting === category.id || category.postCount > 0}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting === category.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
