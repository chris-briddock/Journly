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
        (containerRef.current?.querySelector('.twitter-tweet') ||
         containerRef.current?.querySelector('[data-embed-type="twitter"]')) &&
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
        (containerRef.current?.querySelector('.instagram-media') ||
         containerRef.current?.querySelector('[data-embed-type="instagram"]')) &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('instagram-embed-script')
      ) {
        const script = document.createElement('script');
        script.id = 'instagram-embed-script';
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to load TikTok embeds if they exist in the content
    const loadTikTokEmbeds = () => {
      if (
        (containerRef.current?.querySelector('.tiktok-embed') ||
         containerRef.current?.querySelector('[data-embed-type="tiktok"]')) &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('tiktok-embed-script')
      ) {
        const script = document.createElement('script');
        script.id = 'tiktok-embed-script';
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to load SoundCloud embeds if they exist in the content
    const loadSoundCloudEmbeds = () => {
      if (
        (containerRef.current?.querySelector('iframe[src*="soundcloud.com/player"]') ||
         containerRef.current?.querySelector('[data-embed-type="soundcloud"]')) &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('soundcloud-embed-script')
      ) {
        const script = document.createElement('script');
        script.id = 'soundcloud-embed-script';
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to load CodePen embeds if they exist in the content
    const loadCodePenEmbeds = () => {
      if (
        (containerRef.current?.querySelector('iframe[src*="codepen.io/embed"]') ||
         containerRef.current?.querySelector('[data-embed-type="codepen"]')) &&
        typeof window !== 'undefined' &&
        !window.document.getElementById('codepen-embed-script')
      ) {
        const script = document.createElement('script');
        script.id = 'codepen-embed-script';
        script.src = 'https://cpwebassets.codepen.io/assets/embed/ei.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    // Function to process embeds in the content
    const processEmbeds = () => {
      if (!containerRef.current) return;

      // Process Twitter embeds
      const twitterEmbeds = containerRef.current.querySelectorAll('[data-embed-type="twitter"]');
      twitterEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          // Ensure we're using the original URL format for Twitter embeds
          let twitterUrl = src;
          if (twitterUrl.includes('x.com')) {
            // Convert x.com URLs to twitter.com for better compatibility
            twitterUrl = twitterUrl.replace('x.com', 'twitter.com');
          }

          const blockquote = document.createElement('blockquote');
          blockquote.className = 'twitter-tweet';
          blockquote.setAttribute('data-dnt', 'true');

          const link = document.createElement('a');
          link.href = twitterUrl;
          link.textContent = 'Loading tweet...';

          blockquote.appendChild(link);
          embed.innerHTML = '';
          embed.appendChild(blockquote);
        }
      });

      // Process Instagram embeds
      const instagramEmbeds = containerRef.current.querySelectorAll('[data-embed-type="instagram"]');
      instagramEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          const blockquote = document.createElement('blockquote');
          blockquote.className = 'instagram-media';
          blockquote.setAttribute('data-instgrm-permalink', src);
          blockquote.setAttribute('data-instgrm-version', '14');
          blockquote.style.maxWidth = '540px';
          blockquote.style.width = '100%';
          blockquote.style.margin = '0 auto';
          blockquote.style.background = '#FFF';
          blockquote.style.borderRadius = '3px';
          blockquote.style.border = '1px solid #dbdbdb';
          blockquote.style.boxShadow = 'none';
          blockquote.style.display = 'block';
          blockquote.style.minWidth = '326px';
          blockquote.style.padding = '0';

          const link = document.createElement('a');
          link.href = src;
          link.textContent = 'Loading Instagram post...';

          blockquote.appendChild(link);
          embed.innerHTML = '';
          embed.appendChild(blockquote);
        }
      });

      // Process TikTok embeds
      const tiktokEmbeds = containerRef.current.querySelectorAll('[data-embed-type="tiktok"]');
      tiktokEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          const videoId = src.split('/').pop();
          const blockquote = document.createElement('blockquote');
          blockquote.className = 'tiktok-embed';
          blockquote.setAttribute('cite', src);
          if (videoId) {
            blockquote.setAttribute('data-video-id', videoId);
          }

          const link = document.createElement('a');
          link.href = src;
          link.textContent = 'Loading TikTok...';

          blockquote.appendChild(link);
          embed.innerHTML = '';
          embed.appendChild(blockquote);
        }
      });

      // Process Vimeo embeds
      const vimeoEmbeds = containerRef.current.querySelectorAll('[data-embed-type="vimeo"]');
      vimeoEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          const iframe = document.createElement('iframe');
          iframe.src = src;
          iframe.title = 'Vimeo video';
          iframe.style.width = '100%';
          iframe.style.height = '315px';
          iframe.style.border = 'none';
          iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
          iframe.setAttribute('allowfullscreen', 'true');

          embed.innerHTML = '';
          embed.appendChild(iframe);
        }
      });

      // Process SoundCloud embeds
      const soundcloudEmbeds = containerRef.current.querySelectorAll('[data-embed-type="soundcloud"]');
      soundcloudEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(src)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
          iframe.title = 'SoundCloud track';
          iframe.style.width = '100%';
          iframe.style.height = '166px';
          iframe.style.border = 'none';
          iframe.setAttribute('allow', 'autoplay');

          embed.innerHTML = '';
          embed.appendChild(iframe);
        }
      });

      // Process CodePen embeds
      const codepenEmbeds = containerRef.current.querySelectorAll('[data-embed-type="codepen"]');
      codepenEmbeds.forEach(embed => {
        const src = embed.getAttribute('data-src');
        if (src) {
          const iframe = document.createElement('iframe');
          iframe.src = `${src.replace('/pen/', '/embed/')}?default-tab=result&theme-id=dark`;
          iframe.title = 'CodePen embed';
          iframe.style.width = '100%';
          iframe.style.height = '400px';
          iframe.style.border = 'none';
          iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
          iframe.setAttribute('allowfullscreen', 'true');

          embed.innerHTML = '';
          embed.appendChild(iframe);
        }
      });
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

    // Function to enhance Vimeo embeds
    const enhanceVimeoEmbeds = () => {
      if (containerRef.current) {
        const vimeoIframes = containerRef.current.querySelectorAll('iframe[src*="player.vimeo.com/video"]');
        vimeoIframes.forEach(iframe => {
          const iframeElement = iframe as HTMLIFrameElement;

          // Add missing attributes for better UX
          if (!iframeElement.getAttribute('allowfullscreen')) {
            iframeElement.setAttribute('allowfullscreen', 'true');
          }
          if (!iframeElement.getAttribute('allow')) {
            iframeElement.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
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

    // Function to enhance SoundCloud embeds
    const enhanceSoundCloudEmbeds = () => {
      if (containerRef.current) {
        const soundcloudIframes = containerRef.current.querySelectorAll('iframe[src*="soundcloud.com/player"]');
        soundcloudIframes.forEach(iframe => {
          const iframeElement = iframe as HTMLIFrameElement;

          // Ensure responsive sizing
          if (!iframeElement.style.width) {
            iframeElement.style.width = '100%';
          }
          if (!iframeElement.style.height && !iframeElement.getAttribute('height')) {
            iframeElement.style.height = '166px';
          }
        });
      }
    };

    // Function to enhance CodePen embeds
    const enhanceCodePenEmbeds = () => {
      if (containerRef.current) {
        const codepenIframes = containerRef.current.querySelectorAll('iframe[src*="codepen.io/embed"]');
        codepenIframes.forEach(iframe => {
          const iframeElement = iframe as HTMLIFrameElement;

          // Ensure responsive sizing
          if (!iframeElement.style.width) {
            iframeElement.style.width = '100%';
          }
          if (!iframeElement.style.height && !iframeElement.getAttribute('height')) {
            iframeElement.style.height = '400px';
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

    // Process embeds in the content
    processEmbeds();

    // Load widgets and enhance content
    loadTwitterWidgets();
    loadInstagramEmbeds();
    loadTikTokEmbeds();
    loadSoundCloudEmbeds();
    loadCodePenEmbeds();
    enhanceYouTubeEmbeds();
    enhanceVimeoEmbeds();
    enhanceSoundCloudEmbeds();
    enhanceCodePenEmbeds();
    enhanceTypography();

    // Add responsive styling to prevent overflow
    const addResponsiveStyling = () => {
      if (containerRef.current) {
        // Add responsive container for embeds
        const embedContainers = containerRef.current.querySelectorAll('[data-embed], .twitter-embed, .instagram-embed, .vimeo-embed, .tiktok-embed, .soundcloud-embed, .codepen-embed');
        embedContainers.forEach(container => {
          container.classList.add('w-full', 'overflow-hidden', 'break-words');
        });

        // Add responsive styling to all iframes
        const iframes = containerRef.current.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          const element = iframe as HTMLIFrameElement;
          element.style.maxWidth = '100%';
        });

        // Add responsive styling to blockquotes
        const blockquotes = containerRef.current.querySelectorAll('blockquote.twitter-tweet, blockquote.instagram-media, blockquote.tiktok-embed');
        blockquotes.forEach(blockquote => {
          const element = blockquote as HTMLElement;
          element.style.maxWidth = '100%';
          element.style.width = '100%';
        });
      }
    };

    addResponsiveStyling();

    // Cleanup function
    return () => {
      const twitterScript = document.getElementById('twitter-widget-script');
      const instagramScript = document.getElementById('instagram-embed-script');
      const tiktokScript = document.getElementById('tiktok-embed-script');
      const soundcloudScript = document.getElementById('soundcloud-embed-script');
      const codepenScript = document.getElementById('codepen-embed-script');

      if (twitterScript) {
        twitterScript.remove();
      }

      if (instagramScript) {
        instagramScript.remove();
      }

      if (tiktokScript) {
        tiktokScript.remove();
      }

      if (soundcloudScript) {
        soundcloudScript.remove();
      }

      if (codepenScript) {
        codepenScript.remove();
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
