/**
 * Removes HTML tags from a string
 * @param html String containing HTML tags
 * @returns Clean text without HTML tags
 */
export function cleanHtml(html: string): string {
  if (!html) return '';

  // First try to use DOMParser if in browser environment
  if (typeof window !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch {
      // Fall back to regex if DOMParser fails
    }
  }

  // Regex fallback for server-side or if DOMParser fails
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')   // Replace &amp; with &
    .replace(/&lt;/g, '<')    // Replace &lt; with <
    .replace(/&gt;/g, '>')    // Replace &gt; with >
    .replace(/&quot;/g, '"')  // Replace &quot; with "
    .replace(/&#39;/g, "'")   // Replace &#39; with '
    .trim();                  // Trim whitespace
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text Text to truncate
 * @param length Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, length: number): string {
  if (!text) return '';

  // Clean HTML first
  const cleanText = cleanHtml(text);

  if (cleanText.length <= length) {
    return cleanText;
  }

  // Find the last space before the cutoff to avoid cutting words
  const lastSpace = cleanText.substring(0, length).lastIndexOf(' ');
  const cutoff = lastSpace > 0 ? lastSpace : length;

  return cleanText.substring(0, cutoff) + '...';
}
