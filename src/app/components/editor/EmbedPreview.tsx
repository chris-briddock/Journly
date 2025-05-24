"use client";

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { EmbedType } from '@/lib/tiptap/EmbedExtension';
import { extractYoutubeId, extractVimeoId } from '@/lib/embedUtils';

interface EmbedPreviewProps {
  src: string;
  type: EmbedType;
  title?: string;
}

export function EmbedPreview({ src, type, title }: EmbedPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when src or type changes
    setIsLoading(true);
    setError(null);

    // Simulate loading state for preview
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [src, type]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/20 rounded-md">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <p className="font-medium">Error loading preview</p>
        </div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  // Render appropriate preview based on type
  switch (type) {
    case 'youtube': {
      const youtubeId = extractYoutubeId(src);
      if (!youtubeId) {
        return (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p>Invalid YouTube URL</p>
          </div>
        );
      }

      return (
        <div className="aspect-video bg-black/5 rounded-md overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 max-w-full w-full">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 15l5.19-3L10 9v6z" />
                </svg>
              </div>
              <p className="font-medium">{title || 'YouTube Video'}</p>
              <p className="text-sm text-muted-foreground overflow-hidden max-w-full">
                {src}
              </p>
            </div>
          </div>
        </div>
      );
    }

    case 'twitter':
      return (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
              </svg>
            </div>
            <div className="max-w-[calc(100%-3rem)]">
              <p className="font-medium">Twitter Post</p>
              <p className="text-sm text-muted-foreground overflow-hidden max-w-full">{src}</p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Will display as embedded tweet</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'instagram':
      return (
        <div className="bg-gradient-to-tr from-purple-500 to-pink-500 rounded-md p-1">
          <div className="bg-white dark:bg-black rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="max-w-[calc(100%-3rem)]">
                <p className="font-medium">Instagram Post</p>
                <p className="text-sm text-muted-foreground truncate max-w-full">{src}</p>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span>Will display as embedded Instagram post</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'vimeo': {
      const vimeoId = extractVimeoId(src);
      if (!vimeoId) {
        return (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p>Invalid Vimeo URL</p>
          </div>
        );
      }

      return (
        <div className="aspect-video bg-[#1ab7ea]/10 rounded-md overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 max-w-full w-full">
              <div className="w-16 h-16 rounded-full bg-[#1ab7ea] flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.9765 6.4168c-.105 2.338-1.739 5.5429-4.894 9.6088-3.2679 4.247-6.0258 6.3699-8.2898 6.3699-1.409 0-2.578-1.294-3.553-3.881l-1.9179-7.1138c-.719-2.584-1.488-3.878-2.312-3.878-.179 0-.806.378-1.8809 1.132l-1.129-1.457c1.1899-.996 2.3099-1.989 3.3789-2.99 1.529-1.318 2.679-1.991 3.429-2.028 1.8001-.091 2.9101 1.058 3.3231 3.428.4429 2.8183.7539 4.5723.9238 5.2643.5201 2.3392 1.0899 3.5073 1.7199 3.5073.4859 0 1.2159-.7649 2.1939-2.2953.9689-1.5302 1.4859-2.7002 1.5549-3.5068.1379-1.3254-.3861-1.9881-1.5859-1.9881-.5629 0-1.1439.1295-1.7389.3899 1.1571-3.7949 3.3789-5.6488 6.6681-5.5852 2.4301.0415 3.5752 1.6509 3.4332 4.8308z" />
                </svg>
              </div>
              <p className="font-medium">{title || 'Vimeo Video'}</p>
              <p className="text-sm text-muted-foreground overflow-hidden max-w-full">
                {src}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Add more preview components for other embed types

    case 'tiktok':
      return (
        <div className="bg-black/5 dark:bg-white/5 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.321 5.562a5.122 5.122 0 01-1.152-1.648c-.274-.68-.411-1.39-.411-2.13h-3.91v13.242c0 .62-.164 1.178-.493 1.673a3.766 3.766 0 01-1.345 1.24 3.675 3.675 0 01-1.851.47 3.73 3.73 0 01-2.66-1.099A3.652 3.652 0 016.5 14.645c0-1.005.366-1.872 1.097-2.6.732-.728 1.616-1.092 2.653-1.092.384 0 .75.06 1.097.179v-3.986a7.806 7.806 0 00-1.097-.075c-1.695 0-3.26.47-4.697 1.409a10.437 10.437 0 00-3.428 3.77A9.938 9.938 0 001 17.705a9.767 9.767 0 003.144 7.263 10.555 10.555 0 007.346 2.987c1.695 0 3.26-.47 4.697-1.409a10.437 10.437 0 003.428-3.77 9.938 9.938 0 001.125-4.612V8.346c1.233.879 2.586 1.318 4.06 1.318V5.786a5.164 5.164 0 01-2.063-.41 5.791 5.791 0 01-1.78-1.126l-.636.712z" />
              </svg>
            </div>
            <div className="max-w-[calc(100%-3rem)]">
              <p className="font-medium">TikTok Video</p>
              <p className="text-sm text-muted-foreground truncate max-w-full">{src}</p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Will display as embedded TikTok video</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'soundcloud':
      return (
        <div className="bg-[#ff7700]/10 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff7700] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .105-.061.121-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.121-.12m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.075.075.135.149.135.075 0 .135-.06.15-.135l.24-2.544-.24-2.64c-.015-.06-.075-.135-.149-.135l-.001-.001zm1.005-.3c-.09 0-.149.069-.179.149l-.181 2.94.195 2.865c.015.086.09.149.18.149.074 0 .15-.063.164-.149l.211-2.865-.211-2.94c-.016-.08-.09-.149-.164-.149m1.77-.449c-.104 0-.194.09-.21.194l-.164 3.275.18 3.17c.016.105.09.18.194.18.12 0 .194-.075.21-.18l.194-3.17-.194-3.275c-.016-.105-.105-.194-.21-.194zm.989-.104c-.127 0-.21.09-.224.224l-.15 3.326.165 3.231c.015.12.105.226.225.226.119 0 .209-.105.225-.226l.164-3.231-.164-3.326c-.015-.135-.105-.224-.225-.224zm2.235-2.999c-.045-.09-.12-.149-.209-.149-.105 0-.195.06-.225.149l-.164 6.344.164 3.299c.03.09.135.149.225.149.105 0 .195-.06.21-.149l.18-3.299-.18-6.344zm-.854-.734c-.135 0-.224.06-.26.195l-.149 7.079.164 3.239c.016.135.121.24.256.24.121 0 .234-.105.234-.24l.179-3.239-.181-7.079c-.005-.135-.119-.195-.24-.195m-12.11 6.639c-.051 0-.09.045-.09.09l-.104 1.064.104 1.035c0 .061.045.09.09.09s.104-.029.104-.09l.119-1.035-.119-1.064c0-.06-.045-.09-.09-.09m-.48.135c-.045 0-.075.045-.075.09l-.09 1.004.09.96c0 .06.045.105.09.105.045 0 .075-.045.075-.09l.104-.96-.104-1.004c0-.06-.045-.105-.09-.105zm1.005-.3c-.06 0-.105.045-.105.105l-.119 1.274.119 1.26c0 .06.045.105.105.105s.105-.045.119-.105l.135-1.26-.135-1.274c-.045-.075-.09-.105-.119-.105zm.54-.074c-.074 0-.119.045-.119.12l-.135 1.334.135 1.32c0 .06.045.104.119.104.061 0 .12-.044.12-.104l.15-1.32-.15-1.334c-.06-.09-.12-.12-.12-.12zm.689-.045c-.074 0-.134.045-.134.119l-.15 1.395.15 1.364c0 .075.06.135.134.135.075 0 .135-.06.15-.135l.149-1.364-.149-1.395c-.015-.09-.075-.119-.149-.119zm.855.03c-.09 0-.149.045-.149.135l-.135 1.29.135 1.274c0 .09.06.149.149.149.091 0 .15-.06.15-.149l.15-1.274-.15-1.29c0-.09-.074-.135-.15-.135m4.734-6.629c-.189 0-.344.15-.344.344l-.105 8.394.105 3.359c0 .18.165.344.344.344.18 0 .345-.165.345-.344l.119-3.359-.12-8.394c-.014-.195-.164-.344-.344-.344m-1.275.045c-.166 0-.315.15-.315.314l-.119 8.4.12 3.374c0 .18.148.314.314.314.172 0 .3-.135.314-.314l.136-3.374-.135-8.4c-.016-.165-.15-.3-.314-.314m-2.28 2.654c-.104 0-.194.09-.194.194l-.135 5.86.135 3.375c0 .104.09.18.194.18.12 0 .194-.076.21-.18l.149-3.375-.149-5.86c-.016-.105-.09-.194-.21-.194zm-1.32.194c-.09 0-.179.09-.194.194L4.95 15.891l.135 3.33c.016.104.09.18.195.18.104 0 .194-.9.194-.195l.15-3.33-.15-5.844c0-.105-.09-.195-.195-.195zm-2.204 1.35c-.06 0-.12.045-.12.12l-.165 4.695.165 3.165c0 .074.06.135.12.135.075 0 .135-.06.135-.135l.18-3.18-.18-4.694c0-.06-.06-.12-.135-.12zm-1.17.135c-.06 0-.105.045-.105.105l-.18 4.605.18 3.15c0 .06.045.12.106.12.06 0 .104-.06.104-.12l.21-3.15-.21-4.605c0-.075-.045-.105-.105-.105zm-1.064-.045c-.06 0-.105.045-.105.105l-.195 4.695.195 3.089c0 .06.045.105.105.105.059 0 .104-.045.104-.105l.209-3.089-.209-4.695c0-.06-.045-.105-.105-.105zm5.935 11.138l-5.025-.029-2.07-.016s-.15-.015-.15-.149v-9.749c0-.09.015-.149.15-.149.135 0 1.95.045 2.01.045l5.025.03c.164.015.3.15.3.3v9.419c0 .164-.15.299-.3.299h.06z" />
              </svg>
            </div>
            <div className="max-w-[calc(100%-3rem)]">
              <p className="font-medium">SoundCloud Track</p>
              <p className="text-sm text-muted-foreground truncate max-w-full">{src}</p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Will display as embedded SoundCloud player</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'codepen':
      return (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.01-.02.04-.03.07l-.01.05C0 8.12 0 8.15 0 8.18v7.497c0 .044.003.09.01.135l.01.046c.005.03.01.06.02.086l.015.05c.01.027.016.053.027.075l.022.05c0 .01.015.04.03.06l.03.04c.015.01.03.04.045.06l.03.04.04.04c.01.013.01.03.03.03l.06.042.04.03.01.014 10.97 7.33c.164.12.375.163.57.163s.39-.06.57-.18l10.99-7.28.014-.01.046-.037.06-.043.048-.036.052-.058.033-.045.04-.06.03-.05.03-.07.016-.052.03-.077.015-.045.03-.08v-7.5c0-.05 0-.095-.016-.14l-.014-.045.044.003zm-11.99 6.28l-3.65-2.44 3.65-2.442 3.65 2.44-3.65 2.44zm-1.034-6.674l-4.473 2.99L2.89 8.362l8.086-5.39V7.79zm-6.33 4.233l-2.582 1.73V10.3l2.582 1.726zm1.857 1.25l4.473 2.99v4.82L2.89 15.69l3.618-2.417v-.004zm6.537 2.99l4.474-2.98 3.613 2.42-8.087 5.39v-4.82zm6.33-4.23l2.583-1.72v3.456l-2.583-1.73zm-1.855-1.24L13.042 7.8V2.97l8.085 5.39-3.612 2.415v.003z" />
              </svg>
            </div>
            <div className="max-w-[calc(100%-3rem)]">
              <p className="font-medium">CodePen Embed</p>
              <p className="text-sm text-muted-foreground truncate max-w-full">{src}</p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>Will display as embedded CodePen</span>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <div className="max-w-[calc(100%-2rem)]">
              <p className="font-medium">{title || 'Embedded Content'}</p>
              <p className="text-sm text-muted-foreground truncate max-w-full">{src}</p>
            </div>
          </div>
        </div>
      );
  }
}
