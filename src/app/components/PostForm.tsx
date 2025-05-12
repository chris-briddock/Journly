"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MultiSelect } from "./MultiSelect";
import { Editor } from "./Editor";

type PostFormProps = {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: string;
    categoryIds: string[];
  };
  categories: {
    id: string;
    name: string;
  }[];
  isEditing?: boolean;
};

type FormValues = {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: string;
  categoryIds: string[];
};

export default function PostForm({
  initialData,
  categories,
  isEditing = false,
}: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState(initialData?.content || "");

  const form = useForm<FormValues>({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featuredImage: initialData?.featuredImage || "",
      status: initialData?.status || "draft",
      categoryIds: initialData?.categoryIds || [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError("");

    // Include the content from the editor
    const postData = {
      ...values,
      content,
    };

    try {
      const url = isEditing
        ? `/api/posts/${initialData?.id}`
        : "/api/posts";
      
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(
        isEditing ? "Post updated successfully" : "Post created successfully"
      );
      
      router.push("/dashboard/posts");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Something went wrong");
      toast.error("Failed to save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter post title" {...field} />
                </FormControl>
                <FormDescription>
                  The title of your post. Make it catchy!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Content</FormLabel>
            <Editor
              value={content}
              onChange={setContent}
              placeholder="Write your post content here..."
            />
            <FormDescription>
              The main content of your post. You can use rich text formatting.
            </FormDescription>
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a brief excerpt (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A short summary of your post that will be displayed in previews
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="Image URL" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Simple implementation - in a real app, you would use a proper image upload
                        const url = prompt("Enter image URL");
                        if (url) {
                          field.onChange(url);
                        }
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  URL for the featured image of your post
                </FormDescription>
                <FormMessage />
                {field.value && (
                  <div className="mt-2 relative w-full h-[200px] rounded-md overflow-hidden">
                    <Image
                      src={field.value}
                      alt="Featured image preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={categoryOptions}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select categories"
                  />
                </FormControl>
                <FormDescription>
                  Select one or more categories for your post
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Draft posts are only visible to you. Published posts are visible to everyone.
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Post" : "Create Post"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
