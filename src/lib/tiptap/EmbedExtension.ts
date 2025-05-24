import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EmbedNodeView } from '../../app/components/editor/EmbedNodeView';

/**
 * Supported embed types
 */
export type EmbedType = 'youtube' | 'twitter' | 'instagram' | 'vimeo' | 'soundcloud' | 'tiktok' | 'codepen' | 'generic';

/**
 * Attributes for the embed node
 */
export interface EmbedAttributes {
  /**
   * Source URL for the embed
   */
  src: string;

  /**
   * Type of embed (youtube, twitter, instagram, generic)
   */
  type: EmbedType;

  /**
   * Optional title for the embed
   */
  title?: string;

  /**
   * Width of the embed (CSS value)
   */
  width?: string;

  /**
   * Height of the embed (CSS value)
   */
  height?: string;
}

/**
 * Options for the Embed extension
 */
export interface EmbedOptions {
  /**
   * HTML attributes to apply to the embed node
   */
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Add an embed
       * @param options - Configuration for the embed
       */
      setEmbed: (options: EmbedAttributes) => ReturnType;
    };
  }
}

export const Embed = Node.create<EmbedOptions>({
  name: 'embed',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'embed',
      },
    };
  },

  addAttributes() {
    return {
      /**
       * Source URL for the embed
       */
      src: {
        default: null as unknown as string,
      },
      /**
       * Type of embed (youtube, twitter, instagram, generic)
       */
      type: {
        default: 'generic' as EmbedType,
      },
      /**
       * Optional title for the embed
       */
      title: {
        default: '',
      },
      /**
       * Width of the embed (CSS value)
       */
      width: {
        default: '100%',
      },
      /**
       * Height of the embed (CSS value)
       */
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const element = node as HTMLElement;
          return {
            src: element.getAttribute('data-src') || '',
            type: element.getAttribute('data-embed-type') || 'generic',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type } = HTMLAttributes;
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-embed': '',
        'data-embed-type': type,
        'data-src': src,
        'class': `embed-${type}`,
      }),
      '',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView);
  },

  addCommands() {
    return {
      /**
       * Add an embed to the editor
       * @param options - Configuration for the embed
       */
      setEmbed:
        (options: EmbedAttributes) => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
