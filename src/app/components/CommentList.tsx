"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, ThumbsUp, MoreVertical, Reply, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCommentWithMentions } from "@/lib/commentMentions";
import "./comment-mentions.css";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Separator } from "@/app/components/ui/separator";
import { Textarea } from "@/app/components/ui/textarea";
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
import { CommentForm } from "@/app/components/CommentForm";
import { getInitials } from "@/lib/utils";

export type CommentType = {
  id: string;
  content: string;
  createdAt: Date | string; // Allow both Date and string (ISO format)
  updatedAt?: Date | string; // Make this optional and allow both Date and string
  postId?: string; // Make this optional for tests
  authorId?: string; // Make this optional for tests
  likeCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  parentId: string | null;
  replies?: CommentType[];
};

type CommentListProps = {
  postId: string;
  comments: CommentType[];
  onCommentAdded?: () => void;
};

export function CommentList({ postId, comments, onCommentAdded }: CommentListProps) {
  const { data: session } = useSession();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<CommentType[]>(comments);
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});

  // Group comments by parent
  const parentComments = localComments.filter((comment) => !comment.parentId);
  const commentReplies = localComments.filter((comment) => comment.parentId);

  // Create a map of parent comment IDs to their replies
  const repliesMap = new Map<string, CommentType[]>();
  commentReplies.forEach((reply) => {
    if (reply.parentId) {
      const replies = repliesMap.get(reply.parentId) || [];
      repliesMap.set(reply.parentId, [...replies, reply]);
    }
  });

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
    // Close edit mode if open
    if (editingComment) {
      setEditingComment(null);
    }
  };

  const handleReplySubmitted = () => {
    setReplyingTo(null);
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleEditClick = (comment: CommentType) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
    // Close reply mode if open
    if (replyingTo) {
      setReplyingTo(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update comment");
      }

      // Update the comment in the local state
      setLocalComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: editContent.trim() }
            : comment
        )
      );

      setEditingComment(null);
      setEditContent("");
      toast.success("Comment updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete comment");
      }

      // Remove the comment from the local state
      setLocalComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );

      toast.success("Comment deleted successfully");

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (isLiking[commentId]) return;

    setIsLiking((prev) => ({ ...prev, [commentId]: true }));

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to like comment");
      }

      // Update the like count in the local state
      setLocalComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likeCount: data.liked
                  ? comment.likeCount + 1
                  : Math.max(0, comment.likeCount - 1),
              }
            : comment
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLiking((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComment = (comment: CommentType, isReply = false) => {
    const replies = repliesMap.get(comment.id) || [];
    const isAuthor = session?.user?.id === comment.author.id;
    const isEditing = editingComment === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? "ml-12 mt-4" : "mt-6"}`}>
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || "User"} />
            <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/profile/${comment.author.id}`} className="font-medium hover:underline">
                  {comment.author.name || "Anonymous"}
                </Link>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatDistanceToNow(
                    comment.createdAt instanceof Date ? comment.createdAt : new Date(comment.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Comment actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(comment)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteComment(comment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: formatCommentWithMentions(comment.content) }}
              />
            )}

            {!isEditing && (
              <div className="flex items-center gap-4 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleLikeComment(comment.id)}
                  disabled={isLiking[comment.id]}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  <span>{comment.likeCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleReplyClick(comment.id)}
                >
                  <Reply className="mr-1 h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="mt-4">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  onCommentSubmitted={handleReplySubmitted}
                />
              </div>
            )}
          </div>
        </div>
        {replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>
      <Separator />

      {session ? (
        <CommentForm postId={postId} onCommentSubmitted={onCommentAdded} />
      ) : (
        <div className="rounded-md bg-muted p-4 text-sm">
          <Link href="/login" className="font-medium hover:underline">
            Sign in
          </Link>{" "}
          to leave a comment.
        </div>
      )}

      {parentComments.length > 0 ? (
        <div className="space-y-6">
          {parentComments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
