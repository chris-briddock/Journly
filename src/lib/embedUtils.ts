/**
 * Utility functions for handling embeds in the editor
 */

import { EmbedType } from './tiptap/EmbedExtension';

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param url YouTube URL
 * @returns YouTube video ID or null if not found
 */
export function extractYoutubeId(url: string): string | null {
  // Support various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i,
    /youtube\.com\/shorts\/([^&?/]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract Vimeo video ID from Vimeo URL
 * @param url Vimeo URL
 * @returns Vimeo video ID or null if not found
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/([0-9]+)/i,
    /vimeo\.com\/video\/([0-9]+)/i,
    /player\.vimeo\.com\/video\/([0-9]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Validate Twitter URL (supports both twitter.com and x.com)
 * @param url Twitter URL
 * @returns true if valid Twitter URL
 */
export function isValidTwitterUrl(url: string): boolean {
  // Support both twitter.com and x.com domains
  const twitterRegExp = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i;
  return twitterRegExp.test(url);
}

/**
 * Validate Instagram URL
 * @param url Instagram URL
 * @returns true if valid Instagram URL
 */
export function isValidInstagramUrl(url: string): boolean {
  // Support posts, reels, and stories
  const instagramRegExp = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[a-zA-Z0-9_-]+/i;
  return instagramRegExp.test(url);
}

/**
 * Validate TikTok URL
 * @param url TikTok URL
 * @returns true if valid TikTok URL
 */
export function isValidTikTokUrl(url: string): boolean {
  const tiktokRegExp = /^https?:\/\/(www\.)?(tiktok\.com)\/@[a-zA-Z0-9_\.]+\/video\/[0-9]+/i;
  return tiktokRegExp.test(url);
}

/**
 * Validate CodePen URL
 * @param url CodePen URL
 * @returns true if valid CodePen URL
 */
export function isValidCodePenUrl(url: string): boolean {
  const codepenRegExp = /^https?:\/\/(www\.)?codepen\.io\/[a-zA-Z0-9_-]+\/pen\/[a-zA-Z0-9_-]+/i;
  return codepenRegExp.test(url);
}

/**
 * Validate SoundCloud URL
 * @param url SoundCloud URL
 * @returns true if valid SoundCloud URL
 */
export function isValidSoundCloudUrl(url: string): boolean {
  const soundcloudRegExp = /^https?:\/\/(www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i;
  return soundcloudRegExp.test(url);
}

/**
 * Get error message for invalid embed URL
 * @param type Embed type
 * @param url URL that was attempted
 * @returns Error message
 */
export function getEmbedErrorMessage(type: EmbedType): string {
  switch (type) {
    case 'youtube':
      return 'Invalid YouTube URL. Please use a URL like https://www.youtube.com/watch?v=VIDEO_ID, https://youtu.be/VIDEO_ID, or https://www.youtube.com/shorts/VIDEO_ID';
    case 'twitter':
      return 'Invalid Twitter URL. Please use a URL like https://twitter.com/username/status/123456789 or https://x.com/username/status/123456789';
    case 'instagram':
      return 'Invalid Instagram URL. Please use a URL like https://www.instagram.com/p/CODE, https://www.instagram.com/reel/CODE, or https://www.instagram.com/stories/CODE';
    case 'vimeo':
      return 'Invalid Vimeo URL. Please use a URL like https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789';
    case 'tiktok':
      return 'Invalid TikTok URL. Please use a URL like https://www.tiktok.com/@username/video/123456789';
    case 'codepen':
      return 'Invalid CodePen URL. Please use a URL like https://codepen.io/username/pen/penID';
    case 'soundcloud':
      return 'Invalid SoundCloud URL. Please use a URL like https://soundcloud.com/username/track-name';
    default:
      return 'Invalid URL format';
  }
}

/**
 * Get placeholder text for embed URL input based on type
 * @param type Embed type
 * @returns Placeholder text
 */
export function getEmbedUrlPlaceholder(type: EmbedType): string {
  switch (type) {
    case 'youtube':
      return 'https://www.youtube.com/watch?v=...';
    case 'twitter':
      return 'https://twitter.com/user/status/...';
    case 'instagram':
      return 'https://www.instagram.com/p/...';
    case 'vimeo':
      return 'https://vimeo.com/...';
    case 'tiktok':
      return 'https://www.tiktok.com/@user/video/...';
    case 'codepen':
      return 'https://codepen.io/username/pen/...';
    case 'soundcloud':
      return 'https://soundcloud.com/user/track...';
    default:
      return 'https://...';
  }
}
