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
            <script async src="https://platform.twitter.com/widgets.js"></script>
          </div>
        );
      case 'instagram':
        return (
          <div className="instagram-embed">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={src}
              data-instgrm-version="14"
              style={{
                maxWidth: '540px',
                width: '100%',
                margin: '0 auto',
                background: '#FFF',
                borderRadius: '3px',
                border: '1px solid #dbdbdb',
                boxShadow: 'none',
                display: 'block',
                minWidth: '326px',
                padding: '0'
              }}
            >
              <a href={src} target="_blank" rel="noopener noreferrer">
                {title || 'Loading Instagram post...'}
              </a>
            </blockquote>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Instagram embed will appear in the published post</p>
            </div>
            {/* Load Instagram embed script in the editor view for preview */}
            <script async src="https://www.instagram.com/embed.js"></script>
          </div>
        );
      case 'vimeo':
        return (
          <div className="vimeo-embed">
            <iframe
              src={src}
              title={title || 'Vimeo video'}
              width={width}
              height={height}
              style={{ border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      case 'tiktok':
        return (
          <div className="tiktok-embed">
            <blockquote className="tiktok-embed" cite={src} data-video-id={src.split('/').pop()}>
              <a href={src} target="_blank" rel="noopener noreferrer">
                {title || 'Loading TikTok...'}
              </a>
            </blockquote>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>TikTok embed will appear in the published post</p>
            </div>
            {/* Load TikTok widget script in the editor view for preview */}
            <script async src="https://www.tiktok.com/embed.js"></script>
          </div>
        );
      case 'soundcloud':
        return (
          <div className="soundcloud-embed">
            <iframe
              src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(src)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
              title={title || 'SoundCloud track'}
              width={width}
              height="166"
              style={{ border: 'none' }}
              allow="autoplay"
            />
          </div>
        );
      case 'codepen':
        return (
          <div className="codepen-embed">
            <iframe
              src={`${src.replace('/pen/', '/embed/')}?default-tab=result&theme-id=dark`}
              title={title || 'CodePen embed'}
              width={width}
              height="400"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
              style={{ border: 'none' }}
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
