"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, AtSign } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { CommentMentionList } from "./CommentMentionList";
import { getInitials } from "@/lib/utils";
import { searchUsers } from "@/lib/services/getSearchUsers";


type CommentFormProps = {
  postId: string;
  parentId?: string | null;
  onCommentSubmitted?: () => void;
};

export function CommentForm({ postId, parentId = null, onCommentSubmitted }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<Array<{id: string; label: string; avatar: string | null}>>([]);
  const [cursorPosition, setCursorPosition] = useState<{top: number; left: number} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userInitials = getInitials(session?.user?.name);

  // Handle mention search
  useEffect(() => {
    const fetchUsers = async () => {
      if (mentionQuery !== null) {
        try {
          const users = await searchUsers(mentionQuery);
          setMentionResults(users);
        } catch (error) {
          console.error("Error fetching users for mention:", error);
          setMentionResults([]);
        }
      }
    };

    fetchUsers();
  }, [mentionQuery]);

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
    if (!textareaRef.current) return;

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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add comment");
      }

      setContent("");
      toast.success(parentId ? "Reply added successfully" : "Comment added successfully");

      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  

  if (!session) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={parentId ? "Write a reply... Use @ to mention users" : "Write a comment... Use @ to mention users"}
            value={content}
            onChange={handleTextareaChange}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
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
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {parentId ? "Posting Reply..." : "Posting Comment..."}
            </>
          ) : (
            parentId ? "Post Reply" : "Post Comment"
          )}
        </Button>
      </div>
    </form>
  );
}
