"use client";

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function YouTubeNodeView({
  node,
  editor,
  getPos,
}: NodeViewProps) {
  const { src, width, height } = node.attrs;

  const handleDelete = () => {
    if (typeof getPos === 'function') {
      editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
    }
  };

  return (
    <NodeViewWrapper className="youtube-node-view relative my-4 rounded-md border border-border p-4">
      <div className="youtube-controls absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full bg-background/80 hover:bg-background"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="youtube-content">
        <iframe
          src={src}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </NodeViewWrapper>
  );
}
