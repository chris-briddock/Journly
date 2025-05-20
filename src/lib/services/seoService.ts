/**
 * Service for managing SEO metadata
 */

export interface SeoMetadata {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoCanonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Generates SEO metadata for a post
 * @param postId The ID of the post
 * @returns Generated SEO metadata
 */
export async function generateSeoMetadata(postData: {
  title: string;
  content?: string;
  excerpt?: string;
}): Promise<SeoMetadata> {
  try {
    const response = await fetch('/api/posts/seo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate SEO metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    return {};
  }
}

/**
 * Gets SEO metadata for a post
 * @param postId The ID of the post
 * @returns SEO metadata
 */
export async function getSeoMetadata(postId: string): Promise<SeoMetadata> {
  try {
    const response = await fetch(`/api/posts/seo/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get SEO metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting SEO metadata:', error);
    return {};
  }
}

/**
 * Updates SEO metadata for a post
 * @param postId The ID of the post
 * @param metadata The SEO metadata to update
 * @returns Updated SEO metadata
 */
export async function updateSeoMetadata(
  postId: string,
  metadata: SeoMetadata
): Promise<SeoMetadata> {
  try {
    const response = await fetch(`/api/posts/seo/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to update SEO metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating SEO metadata:', error);
    return {};
  }
}

/**
 * Analyzes SEO metadata and provides recommendations
 * @param metadata The SEO metadata to analyze
 * @returns Analysis results with recommendations
 */
export async function analyzeSeoMetadata(metadata: SeoMetadata): Promise<{
  score: number;
  recommendations: string[];
}> {
  try {
    const response = await fetch('/api/posts/seo/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze SEO metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing SEO metadata:', error);
    return {
      score: 0,
      recommendations: ['Failed to analyze SEO metadata'],
    };
  }
}

const seoService = {
  generateSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  analyzeSeoMetadata,
};

export default seoService;
