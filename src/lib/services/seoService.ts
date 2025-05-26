/**
 * Service for managing SEO metadata
 */

import { getApiUrl } from "../getApiUrl";

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
    const url = getApiUrl('/api/posts/seo');

    // During build time, return default metadata
    if (!url) {
      console.log('[Build] Returning default SEO metadata during static generation');
      return {
        seoTitle: postData.title || 'Default Title',
        seoDescription: postData.excerpt || 'Default description',
        seoKeywords: '',
      };
    }

    const response = await fetch(url, {
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
    const url = getApiUrl(`/api/posts/seo/${postId}`);

    // During build time, return empty metadata
    if (!url) {
      console.log('[Build] Returning empty SEO metadata during static generation');
      return {};
    }

    const response = await fetch(url, {
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
    const url = getApiUrl(`/api/posts/seo/${postId}`);

    // During build time, return the input metadata
    if (!url) {
      console.log('[Build] Returning input SEO metadata during static generation');
      return metadata;
    }

    const response = await fetch(url, {
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
    const url = getApiUrl('/api/posts/seo/analyze');

    // During build time, return default analysis
    if (!url) {
      console.log('[Build] Returning default SEO analysis during static generation');
      return {
        score: 50,
        recommendations: ['Build-time analysis not available'],
      };
    }

    const response = await fetch(url, {
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
