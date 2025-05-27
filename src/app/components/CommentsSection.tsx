"use client";

import { CommentList, CommentType } from "./CommentList";
import { usePostComments } from "@/hooks/use-comments";

type CommentsSectionProps = {
  postId: string;
  initialComments?: CommentType[];
};

export function CommentsSection({ postId, initialComments = [] }: CommentsSectionProps) {
  // Use TanStack Query hook for comments
  const {
    data: comments = initialComments,
    isLoading,
    error,
    refetch
  } = usePostComments(postId);

  // Handle errors
  if (error) {
    console.error("Error fetching comments:", error);
  }

  const handleCommentAdded = () => {
    // Refetch comments when a new comment is added
    refetch();
  };

  return (
    <div className={isLoading ? "opacity-70 pointer-events-none" : ""}>
      <CommentList
        postId={postId}
        comments={comments}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
}
