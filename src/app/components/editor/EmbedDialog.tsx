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
import {
  extractYoutubeId,
  extractVimeoId,
  isValidTwitterUrl,
  isValidInstagramUrl,
  isValidTikTokUrl,
  isValidCodePenUrl,
  isValidSoundCloudUrl,
  getEmbedErrorMessage,
  getEmbedUrlPlaceholder
} from '@/lib/embedUtils';

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
          throw new Error(getEmbedErrorMessage('youtube'));
        }

        const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
        // Use the built-in YouTube extension
        editor.commands.setYoutubeVideo({
          src: embedUrl,
          width: 640,
          height: 480,
        });
      } else if (type === 'vimeo') {
        // Extract Vimeo ID and create embed URL
        const vimeoId = extractVimeoId(url);
        if (!vimeoId) {
          throw new Error(getEmbedErrorMessage('vimeo'));
        }

        const embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
        // For Vimeo embeds, use the Embed extension
        editor.commands.setEmbed({
          src: embedUrl,
          type: 'vimeo',
          title: title || 'Vimeo video',
          width: '100%',
          height: 'auto',
        });
      } else if (type === 'twitter') {
        // Validate Twitter URL
        if (!isValidTwitterUrl(url)) {
          throw new Error(getEmbedErrorMessage('twitter'));
        }

        // For Twitter embeds, use the Embed extension
        // Ensure we're using the original URL format for Twitter embeds
        let twitterUrl = url;
        if (twitterUrl.includes('x.com')) {
          // Convert x.com URLs to twitter.com for better compatibility
          twitterUrl = twitterUrl.replace('x.com', 'twitter.com');
        }

        editor.commands.setEmbed({
          src: twitterUrl,
          type: 'twitter',
          title: title || 'Twitter post',
        });
      } else if (type === 'instagram') {
        // Validate Instagram URL
        if (!isValidInstagramUrl(url)) {
          throw new Error(getEmbedErrorMessage('instagram'));
        }

        // For Instagram embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'instagram',
          title: title || 'Instagram post',
        });
      } else if (type === 'tiktok') {
        // Validate TikTok URL
        if (!isValidTikTokUrl(url)) {
          throw new Error(getEmbedErrorMessage('tiktok'));
        }

        // For TikTok embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'tiktok',
          title: title || 'TikTok video',
        });
      } else if (type === 'codepen') {
        // Validate CodePen URL
        if (!isValidCodePenUrl(url)) {
          throw new Error(getEmbedErrorMessage('codepen'));
        }

        // For CodePen embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'codepen',
          title: title || 'CodePen',
        });
      } else if (type === 'soundcloud') {
        // Validate SoundCloud URL
        if (!isValidSoundCloudUrl(url)) {
          throw new Error(getEmbedErrorMessage('soundcloud'));
        }

        // For SoundCloud embeds, use the Embed extension
        editor.commands.setEmbed({
          src: url,
          type: 'soundcloud',
          title: title || 'SoundCloud track',
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

  // Helper functions are now imported from embedUtils.ts

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
                <SelectItem value="vimeo" data-testid="vimeo-option">Vimeo</SelectItem>
                <SelectItem value="twitter" data-testid="twitter-option">Twitter</SelectItem>
                <SelectItem value="instagram" data-testid="instagram-option">Instagram</SelectItem>
                <SelectItem value="tiktok" data-testid="tiktok-option">TikTok</SelectItem>
                <SelectItem value="soundcloud" data-testid="soundcloud-option">SoundCloud</SelectItem>
                <SelectItem value="codepen" data-testid="codepen-option">CodePen</SelectItem>
                <SelectItem value="generic" data-testid="generic-option">Generic Iframe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="embed-url">URL</Label>
            <div className="relative">
              <Input
                id="embed-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={getEmbedUrlPlaceholder(type)}
                className="pr-2 text-ellipsis"
              />
            </div>
          </div>

          {(type === 'twitter' || type === 'instagram' || type === 'vimeo' ||
            type === 'tiktok' || type === 'soundcloud' || type === 'codepen' || type === 'generic') && (
            <div className="grid gap-2">
              <Label htmlFor="embed-title">Title (Optional)</Label>
              <div className="relative">
                <Input
                  id="embed-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title for the embedded content"
                  className="pr-2 text-ellipsis"
                />
              </div>
            </div>
          )}


          <div className="mt-2 text-xs text-muted-foreground">
            {type === 'youtube' && (
              <p>Tip: You can use regular YouTube URLs, Shorts, or embed links.</p>
            )}
            {type === 'twitter' && (
              <p>Tip: Copy the URL of a specific tweet from Twitter or X.com.</p>
            )}
            {type === 'instagram' && (
              <p>Tip: Use the URL of an Instagram post, reel, or story.</p>
            )}
            {type === 'vimeo' && (
              <p>Tip: Use the URL of a Vimeo video page or embed link.</p>
            )}
          </div>
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
