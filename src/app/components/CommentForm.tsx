"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AtSign } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { CommentMentionList } from "./CommentMentionList";
import { getInitials } from "@/lib/utils";
import { useSearchUsers } from "@/hooks/use-users";
import { useCreateComment } from "@/hooks/use-comments";

type CommentFormProps = {
  postId: string;
  parentId?: string | null;
  onCommentSubmitted?: () => void;
};

export function CommentForm({ postId, parentId = null, onCommentSubmitted }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{top: number; left: number} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userInitials = getInitials(session?.user?.name);

  // Use TanStack Query for user search
  const { data: searchResults = [] } = useSearchUsers(
    mentionQuery || '',
    10,
    mentionQuery !== null // Enable search when mentionQuery is not null (including empty string)
  );

  // Use TanStack Query for creating comments
  const createCommentMutation = useCreateComment();

  // Transform search results to match expected format
  const mentionResults = searchResults
    .filter(user => user && (user.name || user.email)) // Filter out invalid users
    .map(user => ({
      id: user.id,
      label: user.name || user.email || 'Unknown User',
      avatar: user.image
    }));

  // Handle textarea input to detect @ mentions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for mention pattern
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);

    // Find the last @ symbol before cursor
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      // Check if there's a space between the last @ and the cursor
      const textBetweenAtAndCursor = textBeforeCursor.substring(lastAtPos + 1);

      if (!textBetweenAtAndCursor.includes(' ') && textBetweenAtAndCursor.length > 0) {
        // We have a potential mention
        setMentionQuery(textBetweenAtAndCursor);

        // Calculate position for the mention dropdown
        const cursorCoords = getCaretCoordinates(textarea, cursorPos);
        setCursorPosition({
          top: cursorCoords.top + 20, // Add some offset
          left: cursorCoords.left
        });
      } else if (textBetweenAtAndCursor.length === 0) {
        // Just typed @, start with empty query
        setMentionQuery('');

        // Calculate position for the mention dropdown
        const cursorCoords = getCaretCoordinates(textarea, cursorPos);
        setCursorPosition({
          top: cursorCoords.top + 20, // Add some offset
          left: cursorCoords.left
        });
      } else {
        // No active mention
        setMentionQuery(null);
        setCursorPosition(null);
      }
    } else {
      // No @ symbol found
      setMentionQuery(null);
      setCursorPosition(null);
    }
  };

  // Helper function to get caret coordinates in textarea
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const { offsetLeft: elementLeft, offsetTop: elementTop } = element;

    // Create a temporary element to measure position
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.height = 'auto';
    div.style.width = element.offsetWidth + 'px';
    div.style.fontSize = window.getComputedStyle(element).fontSize;
    div.style.fontFamily = window.getComputedStyle(element).fontFamily;
    div.style.lineHeight = window.getComputedStyle(element).lineHeight;
    div.style.padding = window.getComputedStyle(element).padding;

    div.textContent = element.value.substring(0, position);

    // Create a span for the caret position
    const span = document.createElement('span');
    span.textContent = '.';
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetLeft: spanLeft, offsetTop: spanTop } = span;
    document.body.removeChild(div);

    return {
      left: elementLeft + spanLeft,
      top: elementTop + spanTop
    };
  };

  // Handle selecting a user from the mention dropdown
  const handleSelectMention = (user: {id: string; label: string}) => {
    if (!textareaRef.current || !user || !user.label) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos === -1) return;

    // Replace the @query with @username
    const newContent =
      content.substring(0, lastAtPos) +
      `@${user.label} ` +
      content.substring(cursorPos);

    setContent(newContent);

    // Reset mention state
    setMentionQuery(null);
    setCursorPosition(null);

    // Focus back on textarea and set cursor position after the inserted mention
    textarea.focus();
    const newCursorPos = lastAtPos + user.label.length + 2; // +2 for @ and space
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    // Use TanStack Query mutation
    createCommentMutation.mutate(
      {
        postId,
        content: content.trim(),
        parentId: parentId || undefined,
      },
      {
        onSuccess: () => {
          setContent("");
          setSubscriptionError(null); // Clear any previous subscription errors

          if (onCommentSubmitted) {
            onCommentSubmitted();
          }
        },
        onError: (error: Error & { status?: number; subscriptionRequired?: boolean; error?: string }) => {
          // Check if this is a subscription-related error
          if (error.status === 403 && error.subscriptionRequired) {
            setSubscriptionError(error.error || 'Subscription required');
            return;
          }
          // Error toast is already handled in the hook
        },
      }
    );
  };



  if (!session) {
    return null;
  }

  return (
    <div className="space-y-4">
      {subscriptionError && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            {subscriptionError}{" "}
            <Link href="/subscription" className="font-medium underline hover:no-underline">
              Upgrade your subscription
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={
              subscriptionError
                ? "Upgrade your subscription to comment"
                : parentId
                  ? "Write a reply... Use @ to mention users"
                  : "Write a comment... Use @ to mention users"
            }
            value={content}
            onChange={handleTextareaChange}
            className="min-h-[100px] resize-none"
            disabled={createCommentMutation.isPending || !!subscriptionError}
          />

          {/* Mention dropdown */}
          {mentionQuery !== null && cursorPosition && (
            <div
              className="absolute z-10"
              style={{
                top: `${cursorPosition.top}px`,
                left: `${cursorPosition.left}px`
              }}
            >
              <CommentMentionList
                items={mentionResults}
                command={handleSelectMention}
                ref={null} // We're not using the ref functionality here
              />
            </div>
          )}

          <div className="mt-2 text-xs text-muted-foreground">
            <AtSign className="inline h-3 w-3 mr-1" />
            Mention users with @username
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={createCommentMutation.isPending || !content.trim() || !!subscriptionError}>
          {createCommentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {parentId ? "Posting Reply..." : "Posting Comment..."}
            </>
          ) : subscriptionError ? (
            "Subscription Required"
          ) : (
            parentId ? "Post Reply" : "Post Comment"
          )}
        </Button>
      </div>
      </form>
    </div>
  );
}
