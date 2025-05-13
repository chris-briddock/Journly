"use client";

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { EmbedType } from '@/lib/tiptap/EmbedExtension';

interface EmbedDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmbedDialog({ editor, open, onOpenChange }: EmbedDialogProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EmbedType>('youtube');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!url) {
        throw new Error('URL is required');
      }

      if (!editor) {
        throw new Error('Editor not available');
      }

      if (type === 'youtube') {
        // Extract YouTube ID and create embed URL
        const youtubeId = extractYoutubeId(url);
        if (!youtubeId) {
          throw new Error('Invalid YouTube URL');
        }

        const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
        // Use the built-in YouTube extension
        editor.commands.setYoutubeVideo({
          src: embedUrl,
          width: 640,
          height: 480,
        });
      } else if (type === 'twitter') {
        // Validate Twitter URL
        if (!isValidTwitterUrl(url)) {
          throw new Error('Invalid Twitter URL. Please use a URL like https://twitter.com/username/status/123456789');
        }

        // For Twitter embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'twitter',
          title: title || 'Twitter post',
        });
      } else if (type === 'instagram') {
        // Validate Instagram URL
        if (!isValidInstagramUrl(url)) {
          throw new Error('Invalid Instagram URL. Please use a URL like https://www.instagram.com/p/abcdef123/');
        }

        // For Instagram embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'instagram',
          title: title || 'Instagram post',
        });
      } else {
        // For other embed types
        editor.commands.setEmbed({
          src: url,
          type,
          title: title || undefined,
        });
      }

      // Reset form and close dialog
      setUrl('');
      setTitle('');
      setType('youtube');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add embed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to extract YouTube video ID from various YouTube URL formats
  const extractYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper function to validate Twitter URL
  const isValidTwitterUrl = (url: string): boolean => {
    // Twitter/X URL patterns
    const twitterRegExp = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/;
    return twitterRegExp.test(url);
  };

  // Helper function to validate Instagram URL
  const isValidInstagramUrl = (url: string): boolean => {
    // Instagram URL patterns
    const instagramRegExp = /^https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[a-zA-Z0-9_-]+/;
    return instagramRegExp.test(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Embed</DialogTitle>
          <DialogDescription>
            Insert embedded content from external sources like YouTube, Twitter, etc.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="embed-type">Embed Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as EmbedType)}
            >
              <SelectTrigger id="embed-type">
                <SelectValue placeholder="Select embed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube" data-testid="youtube-option">YouTube</SelectItem>
                <SelectItem value="twitter" data-testid="twitter-option">Twitter</SelectItem>
                <SelectItem value="instagram" data-testid="instagram-option">Instagram</SelectItem>
                <SelectItem value="generic" data-testid="generic-option">Generic Iframe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="embed-url">URL</Label>
            <Input
              id="embed-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : type === 'twitter'
                  ? 'https://twitter.com/user/status/...'
                  : type === 'instagram'
                  ? 'https://www.instagram.com/p/...'
                  : 'https://...'
              }
            />
          </div>

          {(type === 'twitter' || type === 'instagram' || type === 'generic') && (
            <div className="grid gap-2">
              <Label htmlFor="embed-title">Title (Optional)</Label>
              <Input
                id="embed-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title for the embedded content"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Embed'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
