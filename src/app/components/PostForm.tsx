"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Upload, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useCreatePost, useUpdatePost, useSchedulePost } from "@/hooks/use-posts";

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
import { SeoSection } from "./SeoSection";

type PostFormProps = {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    status: string;
    categoryIds: string[];
    scheduledPublishAt?: string | Date;
    isPremium?: boolean;
    // SEO fields
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    seoCanonicalUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
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
  publishAt: Date | null;
  isPremium: boolean;
  // SEO fields
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoCanonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
};

export default function PostForm({
  initialData,
  categories,
  isEditing = false,
}: PostFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [content, setContent] = useState(initialData?.content || "");

  // Use TanStack Query mutations
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const schedulePostMutation = useSchedulePost();



  // Get the scheduled date if it exists
  const scheduledDate = initialData?.scheduledPublishAt ? new Date(initialData.scheduledPublishAt) : null;

  const form = useForm<FormValues>({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featuredImage: initialData?.featuredImage || "",
      status: initialData?.status || "draft",
      categoryIds: initialData?.categoryIds || [],

      publishAt: scheduledDate,
      isPremium: false, // Always set to false as we've removed the premium option
      // SEO fields
      seoTitle: initialData?.seoTitle || "",
      seoDescription: initialData?.seoDescription || "",
      seoKeywords: initialData?.seoKeywords || "",
      seoCanonicalUrl: initialData?.seoCanonicalUrl || "",
      ogImage: initialData?.ogImage || "",
      noIndex: initialData?.noIndex || false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");

    // Include the content from the editor and prepare SEO data
    const postData = {
      ...values,
      content,
      // Ensure SEO fields are properly formatted
      seoTitle: values.seoTitle || values.title,
      seoDescription: values.seoDescription || values.excerpt,
      seoKeywords: values.seoKeywords,
      seoCanonicalUrl: values.seoCanonicalUrl,
      ogImage: values.ogImage || values.featuredImage,
      noIndex: values.noIndex,
    };

    // If status is scheduled, handle scheduling
    if (values.status === "scheduled" && values.publishAt) {
      const statusToSave = "scheduled";
      const dataToSave = { ...postData, status: statusToSave };

      if (isEditing && initialData?.id) {
        // Update existing post and schedule
        updatePostMutation.mutate(
          { id: initialData.id, data: dataToSave },
          {
            onSuccess: (savedPost) => {
              // Then schedule the post
              schedulePostMutation.mutate(
                { postId: savedPost.id, publishAt: values.publishAt! },
                {
                  onSuccess: () => {
                    router.push("/dashboard/posts");
                    router.refresh();
                  },
                  onError: (error: Error) => {
                    setError(error.message || "Failed to schedule post");
                  },
                }
              );
            },
            onError: (error: Error) => {
              if (error.message.includes("subscription")) {
                router.push("/subscription");
                return;
              }
              setError(error.message || "Failed to save post");
            },
          }
        );
      } else {
        // Create new post and schedule
        createPostMutation.mutate(dataToSave, {
          onSuccess: (savedPost) => {
            // Then schedule the post
            schedulePostMutation.mutate(
              { postId: savedPost.id, publishAt: values.publishAt! },
              {
                onSuccess: () => {
                  router.push("/dashboard/posts");
                  router.refresh();
                },
                onError: (error: Error) => {
                  setError(error.message || "Failed to schedule post");
                },
              }
            );
          },
          onError: (error: Error) => {
            if (error.message.includes("subscription")) {
              router.push("/subscription");
              return;
            }
            setError(error.message || "Failed to save post");
          },
        });
      }
    } else {
      // Regular post creation/update
      if (isEditing && initialData?.id) {
        // Update existing post
        updatePostMutation.mutate(
          { id: initialData.id, data: postData },
          {
            onSuccess: () => {
              router.push("/dashboard/posts");
              router.refresh();
            },
            onError: (error: Error) => {
              if (error.message.includes("subscription")) {
                router.push("/subscription");
                return;
              }
              setError(error.message || "Failed to save post");
            },
          }
        );
      } else {
        // Create new post
        createPostMutation.mutate(postData, {
          onSuccess: () => {
            router.push("/dashboard/posts");
            router.refresh();
          },
          onError: (error: Error) => {
            if (error.message.includes("subscription")) {
              router.push("/subscription");
              return;
            }
            setError(error.message || "Failed to save post");
          },
        });
      }
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
                  onValueChange={(value) => {
                    field.onChange(value);

                    // Handle status changes
                    if (value === "scheduled") {
                      // If changing to scheduled, ensure a date is set
                      if (!form.getValues("publishAt")) {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        form.setValue("publishAt", tomorrow);
                      }
                    } else {
                      // If not scheduled, clear the publish date
                      form.setValue("publishAt", null);
                    }
                  }}
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Draft posts are only visible to you. Published posts are visible to everyone.
                  Scheduled posts will be automatically published at the scheduled time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Schedule checkbox removed - now handled entirely by the status dropdown */}

          {form.watch("status") === "scheduled" && (
            <FormField
              control={form.control}
              name="publishAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Publish Date and Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="datetime-local"
                        value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ""}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          field.onChange(date);
                        }}
                        className="w-full"
                        disabled={form.watch("status") === "published"}
                      />
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose when to publish this post. Must be a future date and time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Premium content option removed */}

          {/* SEO Section */}
          <div className="pt-4">
            <SeoSection
              form={form}
              title={form.watch("title")}
              description={form.watch("excerpt")}
              featuredImage={form.watch("featuredImage")}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createPostMutation.isPending || updatePostMutation.isPending || schedulePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending || schedulePostMutation.isPending}>
              {(createPostMutation.isPending || updatePostMutation.isPending || schedulePostMutation.isPending) ? (
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
