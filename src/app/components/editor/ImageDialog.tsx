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
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface ImageDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDialog({ editor, open, onOpenChange }: ImageDialogProps) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!url) {
        throw new Error('Image URL is required');
      }

      if (!editor) {
        throw new Error('Editor not available');
      }

      // Insert the image
      editor.chain().focus().setImage({ 
        src: url,
        alt: alt || undefined,
      }).run();

      // Reset form and close dialog
      setUrl('');
      setAlt('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add image');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>
            Insert an image by providing its URL.
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
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image-alt">Alt Text (Optional)</Label>
            <Input
              id="image-alt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Description of the image"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
