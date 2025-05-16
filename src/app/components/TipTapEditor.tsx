"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import Mention from "@tiptap/extension-mention";
import Heading from "@tiptap/extension-heading";
import { Embed } from "@/lib/tiptap/EmbedExtension";
import { mentionSuggestion } from "@/lib/tiptap/suggestion";
import "./editor/editor.css";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Pilcrow,
  AtSign,
  Undo,
  Redo,
} from "lucide-react";
import { Youtube as YoutubeIcon } from "./icons/Youtube";
import { cn } from "@/lib/utils";

import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { EmbedDialog } from "./editor/EmbedDialog";

type TipTapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
}: TipTapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable the built-in heading extension
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        history: {
          depth: 100,
          newGroupDelay: 500,
        },
      }),
      // Add the heading extension separately for better control
      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          class: 'heading',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        progressBarColor: 'white',
        modestBranding: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'bg-primary/20 rounded px-1 py-0.5 text-primary font-medium whitespace-nowrap',
        },
        suggestion: mentionSuggestion,
      }),
      // Add the Embed extension for Twitter, Instagram, etc.
      Embed.configure({
        HTMLAttributes: {
          class: 'embed',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
      handleDOMEvents: {
        keydown: (_view, event) => {
          // Prevent default tab behavior
          if (event.key === 'Tab') {
            return true;
          }
          return false;
        },
      },
    },
    // Explicitly set to false to avoid SSR hydration warnings
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    setLinkUrl(previousUrl || '');
    setLinkDialogOpen(true);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    setImageUrl('');
    setImageAlt('');
    setImageDialogOpen(true);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div
      data-testid="tiptap-editor"
      className={cn(
        "border border-input rounded-md overflow-hidden",
        className
      )}
    >
      <div data-testid="editor-toolbar" className="bg-muted/50 p-1 border-b flex flex-wrap gap-1">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  editor.isActive("heading", { level: 1 }) && "bg-accent"
                )}
                onClick={() => {
                  // Force a paragraph first to ensure clean toggling
                  editor.chain().focus().setParagraph().run();
                  // Then toggle the heading
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  console.log('H1 button clicked, editor HTML:', editor.getHTML());
                }}
                aria-label="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  editor.isActive("heading", { level: 2 }) && "bg-accent"
                )}
                onClick={() => {
                  // Force a paragraph first to ensure clean toggling
                  editor.chain().focus().setParagraph().run();
                  // Then toggle the heading
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  console.log('H2 button clicked, editor HTML:', editor.getHTML());
                }}
                aria-label="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("paragraph") && "bg-accent")}
                onClick={() => editor.chain().focus().setParagraph().run()}
                aria-label="Paragraph"
              >
                <Pilcrow className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Paragraph</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent")}
                onClick={() => editor.chain().focus().toggleBold().run()}
                aria-label="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-accent")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-accent")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", editor.isActive("link") && "bg-accent")}
                onClick={setLink}
                aria-label="Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={addImage}
                aria-label="Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEmbedDialogOpen(true);
                  // Default to YouTube embed
                }}
                aria-label="Embed Media"
              >
                <YoutubeIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Embed Media (YouTube, Twitter, Instagram)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (editor) {
                    // Insert @ character to trigger mention suggestion
                    editor.chain().focus().insertContent('@').run();
                  }
                }}
                aria-label="Mention User"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mention User</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                aria-label="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                aria-label="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          {/* Debug button - only visible in development */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => {
                console.log('Current editor HTML:', editor.getHTML());
                console.log('Editor state:', editor.getJSON());
                alert('Check console for editor HTML and state');
              }}
            >
              Debug
            </Button>
          )}
        </TooltipProvider>
      </div>

      <EditorContent data-testid="editor-content" editor={editor} />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>
              Enter the URL for the link
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkUrl) {
                  editor.chain().focus().setLink({ href: linkUrl }).run();
                  console.log('Link added:', linkUrl, 'HTML:', editor.getHTML());
                } else {
                  editor.chain().focus().unsetLink().run();
                  console.log('Link removed, HTML:', editor.getHTML());
                }
                setLinkDialogOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Enter the URL for the image
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageAlt">Alt Text</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (imageUrl) {
                  editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
                  console.log('Image added:', imageUrl, 'HTML:', editor.getHTML());
                }
                setImageDialogOpen(false);
              }}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Dialog */}
      <EmbedDialog
        editor={editor}
        open={embedDialogOpen}
        onOpenChange={setEmbedDialogOpen}
      />
    </div>
  );
}
