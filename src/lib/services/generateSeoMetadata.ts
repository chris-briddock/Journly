/**
 * Service for generating SEO metadata for posts
 */

interface SeoMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

interface PostData {
  title: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoCanonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Extracts keywords from content using basic NLP techniques
 * @param content The post content to extract keywords from
 * @param maxKeywords Maximum number of keywords to extract
 * @returns Comma-separated list of keywords
 */
export function extractKeywords(content: string, maxKeywords = 5): string {
  if (!content) return '';

  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ');

  // Split into words and filter out common words and short words
  const commonWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'of', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'can', 'could', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those',
    'it', 'its', 'it\'s', 'they', 'them', 'their', 'theirs', 'he', 'him', 'his',
    'she', 'her', 'hers', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours',
    'i', 'me', 'my', 'mine', 'who', 'whom', 'whose', 'which', 'what', 'where',
    'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'even', 'also'
  ]);

  const words = plainText.toLowerCase()
    .split(/\s+/)
    .filter(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[^\w\s]/g, '');
      // Filter out common words, numbers, and short words
      return cleanWord.length > 3 &&
             !commonWords.has(cleanWord) &&
             !/^\d+$/.test(cleanWord);
    });

  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  // Sort by frequency and get top keywords
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);

  return sortedWords.join(', ');
}

/**
 * Generates a meta description from content
 * @param content The post content to generate description from
 * @param maxLength Maximum length of the description
 * @returns Generated description
 */
export function generateDescription(content: string, maxLength = 160): string {
  if (!content) return '';

  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Get first paragraph or first few sentences
  let description = '';
  const firstParagraph = plainText.split(/\.\s+/)[0];

  if (firstParagraph.length <= maxLength) {
    description = firstParagraph;
  } else {
    // Truncate to maxLength and add ellipsis
    description = firstParagraph.substring(0, maxLength - 3) + '...';
  }

  return description;
}

/**
 * Generates SEO metadata for a post
 * @param post The post data
 * @returns Generated SEO metadata
 */
export function generateSeoMetadata(post: PostData): SeoMetadata {
  // Use provided SEO fields or generate from post data
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt ||
    (post.content ? generateDescription(post.content) : '');

  // Generate keywords if not provided
  const keywords = post.seoKeywords ||
    (post.content ? extractKeywords(post.content) : '');

  // Use provided OG image or featured image
  const ogImage = post.ogImage || post.featuredImage;

  return {
    title,
    description,
    keywords,
    canonicalUrl: post.seoCanonicalUrl,
    ogImage,
    noIndex: post.noIndex,
  };
}

/**
 * Analyzes SEO metadata and provides recommendations
 * @param metadata The SEO metadata to analyze
 * @returns Analysis results with recommendations
 */
export function analyzeSeoMetadata(metadata: SeoMetadata): {
  score: number;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let score = 0;

  // Title analysis
  if (!metadata.title) {
    recommendations.push('Add a title for better SEO');
  } else {
    score += 10; // Has title

    if (metadata.title.length < 30) {
      recommendations.push('Title is too short (less than 30 characters)');
      score += 5;
    } else if (metadata.title.length > 60) {
      recommendations.push('Title is too long (more than 60 characters)');
      score += 5;
    } else {
      recommendations.push('Title length is optimal');
      score += 20;
    }
  }

  // Description analysis
  if (!metadata.description) {
    recommendations.push('Add a meta description for better SEO');
  } else {
    score += 10; // Has description

    if (metadata.description.length < 70) {
      recommendations.push('Description is too short (less than 70 characters)');
      score += 5;
    } else if (metadata.description.length > 160) {
      recommendations.push('Description is too long (more than 160 characters)');
      score += 5;
    } else {
      recommendations.push('Description length is optimal');
      score += 20;
    }
  }

  // Keywords analysis
  if (!metadata.keywords) {
    recommendations.push('Add keywords to improve SEO');
  } else {
    score += 10;
  }

  // Canonical URL analysis
  if (!metadata.canonicalUrl) {
    recommendations.push('Consider adding a canonical URL if this content appears elsewhere');
  } else {
    score += 10;
  }

  // OG Image analysis
  if (!metadata.ogImage) {
    recommendations.push('Add an image for social media sharing');
  } else {
    score += 20;
  }

  // noIndex warning
  if (metadata.noIndex) {
    recommendations.push('Warning: This content will not be indexed by search engines');
  }

  return {
    score,
    recommendations,
  };
}

const seoService = {
  generateSeoMetadata,
  analyzeSeoMetadata,
  extractKeywords,
  generateDescription,
};

export default seoService;
