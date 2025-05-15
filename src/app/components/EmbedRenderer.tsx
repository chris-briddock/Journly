"use client";

import { useEffect, useRef } from 'react';
import { cleanHtml } from '@/lib/cleanHtml';

interface EmbedRendererProps {
  content: string;
}

export function EmbedRenderer({ content }: EmbedRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to load Twitter widgets if they exist in the content
    const loadTwitterWidgets = () => {
      if (
        containerRef.current?.querySelector('.twitter-tweet') &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('twitter-widget-script')
      ) {
        const script = document.createElement('script');
        script.id = 'twitter-widget-script';
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to load Instagram embeds if they exist in the content
    const loadInstagramEmbeds = () => {
      if (
        containerRef.current?.querySelector('.instagram-media') &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('instagram-embed-script')
      ) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to ensure YouTube iframes have proper attributes
    const enhanceYouTubeEmbeds = () => {
      if (containerRef.current) {
        const youtubeIframes = containerRef.current.querySelectorAll('iframe[src*="youtube.com/embed"]');
        youtubeIframes.forEach(iframe => {
          // Cast iframe to HTMLIFrameElement to access style property
          const iframeElement = iframe as HTMLIFrameElement;

          // Add missing attributes for better UX
          if (!iframeElement.getAttribute('allowfullscreen')) {
            iframeElement.setAttribute('allowfullscreen', 'true');
          }
          if (!iframeElement.getAttribute('allow')) {
            iframeElement.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          }
          // Ensure responsive sizing
          if (!iframeElement.style.width) {
            iframeElement.style.width = '100%';
          }
          if (!iframeElement.style.height && !iframeElement.getAttribute('height')) {
            iframeElement.style.height = '315px';
          }
        });
      }
    };

    // Function to enhance typography elements
    const enhanceTypography = () => {
      if (containerRef.current) {
        // Add proper styling to headings
        const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
          heading.classList.add('font-semibold', 'mb-4', 'mt-6');

          // Fix for raw HTML tags showing up in content
          if (heading.textContent?.includes('<h1') ||
              heading.textContent?.includes('<h2') ||
              heading.textContent?.includes('<h3') ||
              heading.textContent?.includes('<h4') ||
              heading.textContent?.includes('<h5') ||
              heading.textContent?.includes('<h6')) {
            // Use our cleanHtml utility
            heading.textContent = cleanHtml(heading.textContent);
          }
        });

        // Add proper styling to paragraphs
        const paragraphs = containerRef.current.querySelectorAll('p');
        paragraphs.forEach(paragraph => {
          paragraph.classList.add('my-4');

          // Fix for raw HTML tags showing up in content
          if (paragraph.textContent?.includes('<') && paragraph.textContent?.includes('>')) {
            // Use our cleanHtml utility for any HTML tags
            paragraph.textContent = cleanHtml(paragraph.textContent);
          }
        });

        // Add proper styling to lists
        const lists = containerRef.current.querySelectorAll('ul, ol');
        lists.forEach(list => {
          list.classList.add('my-4', 'ml-6');

          // For unordered lists
          if (list.tagName.toLowerCase() === 'ul') {
            list.classList.add('list-disc');
          }

          // For ordered lists
          if (list.tagName.toLowerCase() === 'ol') {
            list.classList.add('list-decimal');
          }
        });

        // Add proper styling to list items
        const listItems = containerRef.current.querySelectorAll('li');
        listItems.forEach(item => {
          item.classList.add('my-2');
        });

        // Add proper styling to links
        const links = containerRef.current.querySelectorAll('a');
        links.forEach(link => {
          link.classList.add('text-primary', 'hover:underline');
        });

        // Add proper styling to images
        const images = containerRef.current.querySelectorAll('img');
        images.forEach(image => {
          image.classList.add('rounded-lg', 'my-6', 'max-w-full', 'h-auto');
        });

        // Add proper styling to blockquotes
        const blockquotes = containerRef.current.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
          blockquote.classList.add('border-l-4', 'border-muted', 'pl-4', 'italic', 'my-6');
        });

        // Add proper styling to code blocks
        const codeBlocks = containerRef.current.querySelectorAll('pre');
        codeBlocks.forEach(codeBlock => {
          codeBlock.classList.add('bg-muted', 'p-4', 'rounded-md', 'overflow-x-auto', 'my-6');
        });

        // Add proper styling to inline code
        const inlineCodes = containerRef.current.querySelectorAll('code:not(pre code)');
        inlineCodes.forEach(code => {
          code.classList.add('bg-muted', 'px-1.5', 'py-0.5', 'rounded', 'text-sm', 'font-mono');
        });
      }
    };

    // Load widgets and enhance content
    loadTwitterWidgets();
    loadInstagramEmbeds();
    enhanceYouTubeEmbeds();
    enhanceTypography();

    // Cleanup function
    return () => {
      const twitterScript = document.getElementById('twitter-widget-script');
      const instagramScript = document.getElementById('instagram-embed-script');

      if (twitterScript) {
        twitterScript.remove();
      }

      if (instagramScript) {
        instagramScript.remove();
      }
    };
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="embed-renderer prose prose-h1:text-3xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-semibold prose-h4:text-lg prose-h4:font-semibold prose-h5:text-base prose-h5:font-semibold prose-h6:text-sm prose-h6:font-semibold prose-headings:mt-6 prose-headings:mb-4 prose-p:my-4 prose-p:text-base prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-em:italic prose-code:bg-muted prose-code:p-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic prose-img:rounded-lg prose-img:my-8 prose-video:my-8 prose-hr:my-8 prose-ol:pl-6 prose-ol:my-4 prose-ul:pl-6 prose-ul:my-4 prose-li:my-2 prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:p-2 prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
