"use client";

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { EmbedType } from '@/lib/tiptap/EmbedExtension';
import { JSX } from 'react';

interface EmbedNodeAttributes {
  src: string;
  type: EmbedType;
  title: string;
  width: string;
  height: string;
}

export function EmbedNodeView({
  node,
  editor,
  getPos,
}: NodeViewProps) {
  const { src, type, title, width, height } = node.attrs as EmbedNodeAttributes;

  const handleDelete = () => {
    if (typeof getPos === 'function') {
      editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
    }
  };

  const renderEmbed = (): JSX.Element => {
    switch (type) {
      case 'twitter':
        return (
          <div className="twitter-embed">
            <blockquote className="twitter-tweet" data-dnt="true">
              <a href={src} target="_blank" rel="noopener noreferrer">
                {title || 'Loading tweet...'}
              </a>
            </blockquote>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Twitter/X embed will appear in the published post</p>
            </div>
            {/* Load Twitter widget script in the editor view for preview */}
            <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
          </div>
        );
      case 'instagram':
        return (
          <div className="instagram-embed">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={src}
              data-instgrm-version="14"
              style={{ maxWidth: '540px', width: '100%', margin: '0 auto' }}
            >
              <a href={src} target="_blank" rel="noopener noreferrer">
                {title || 'Loading Instagram post...'}
              </a>
            </blockquote>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Instagram embed will appear in the published post</p>
            </div>
            {/* Load Instagram embed script in the editor view for preview */}
            <script async src="//www.instagram.com/embed.js" charSet="utf-8"></script>
          </div>
        );
      case 'generic':
      default:
        return (
          <div className="generic-embed">
            <iframe
              src={src}
              title={title || 'Embedded content'}
              width={width}
              height={height}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
    }
  };

  return (
    <NodeViewWrapper className="embed-node-view relative my-4 rounded-md border border-border p-4">
      <div className="embed-controls absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-background/80 hover:bg-background"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="embed-content">
        {renderEmbed()}
      </div>
    </NodeViewWrapper>
  );
}
