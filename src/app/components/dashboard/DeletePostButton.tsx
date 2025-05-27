"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useDeletePost } from "@/hooks/use-posts";

import { Button } from "../../components/ui/button";
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
} from "../../components/ui/alert-dialog";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Use TanStack Query mutation for delete
  const deletePostMutation = useDeletePost();

  const handleDelete = async () => {
    // Use TanStack Query mutation
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        router.refresh();
        setIsOpen(false);
      },
      onError: () => {
        // Error toast is already handled in the hook
        setIsOpen(false);
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{postTitle}&quot; and all of its data.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePostMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deletePostMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePostMutation.isPending ? (
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
  );
}
