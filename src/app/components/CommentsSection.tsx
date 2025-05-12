"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CommentList, CommentType } from "./CommentList";

type CommentsSectionProps = {
  postId: string;
  initialComments: CommentType[];
};

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      toast.error("Failed to load comments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
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
