"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";

type CategoryFormProps = {
  initialData?: {
    id?: string;
    name: string;
    description: string;
  };
  isEditing?: boolean;
};

type FormValues = {
  name: string;
  description: string;
};

export default function CategoryForm({
  initialData,
  isEditing = false,
}: CategoryFormProps = {}) {
  const router = useRouter();
  const [error, setError] = useState("");

  // Use TanStack Query mutations
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const form = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");

    if (isEditing && initialData?.id) {
      // Use update mutation
      updateCategoryMutation.mutate(
        { id: initialData.id, data: values },
        {
          onSuccess: () => {
            router.push("/dashboard/categories");
            router.refresh();
          },
          onError: (error: Error) => {
            setError(error.message || "Something went wrong");
          },
        }
      );
    } else {
      // Use create mutation
      createCategoryMutation.mutate(values, {
        onSuccess: () => {
          router.push("/dashboard/categories");
          router.refresh();
        },
        onError: (error: Error) => {
          setError(error.message || "Something went wrong");
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
                </FormControl>
                <FormDescription>
                  This is how the category will appear on your posts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter category description (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of what this category is about
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
              {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Category" : "Create Category"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
