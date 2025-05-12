/**
 * Calculate the estimated reading time for a given text
 * @param text The text content to calculate reading time for
 * @param wordsPerMinute The average reading speed in words per minute (default: 225)
 * @returns The estimated reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 225): number {
  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '');
  
  // Count words by splitting on whitespace
  const words = plainText.trim().split(/\s+/).length;
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(words / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, readingTime);
}

/**
 * Format the reading time into a human-readable string
 * @param minutes The reading time in minutes
 * @returns A formatted string (e.g., "5 min read")
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
