// Client-side API functions for fetching data

/**
 * Get posts with optional filtering and pagination
 */
export async function getPosts(options: {
  page?: number;
  limit?: number;
  categoryId?: string;
  authorId?: string;
  status?: string;
  q?: string;
}) {
  const { page = 1, limit = 10, categoryId, authorId, status, q } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (categoryId) params.append('categoryId', categoryId);
  if (authorId) params.append('authorId', authorId);
  if (status) params.append('status', status);
  if (q) params.append('q', q);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/posts?${params.toString()}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

/**
 * Get a single post by ID
 */
export async function getPost(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/posts/${id}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

/**
 * Get all categories
 */
export async function getCategories() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/categories`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/categories/${id}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch category');
  }

  return response.json();
}

/**
 * Get user profile by ID
 */
export async function getUser(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/users/${id}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

/**
 * Get user posts by user ID
 */
export async function getUserPosts(userId: string, options: { limit?: number; page?: number } = {}) {
  const { limit = 9, page = 1 } = options;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  params.append('status', 'published');

  const response = await fetch(`${baseUrl}/api/users/${userId}/posts?${params.toString()}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user posts');
  }

  return response.json();
}

/**
 * Get recent posts
 */
export async function getRecentPosts(limit = 5) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/posts/recent?limit=${limit}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent posts');
  }

  return response.json();
}

/**
 * Get popular categories
 */
export async function getPopularCategories(limit = 10) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/categories/popular?limit=${limit}`, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch popular categories');
  }

  return response.json();
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(userId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const response = await fetch(`${baseUrl}/api/users/${userId}/is-following`, {
    next: { revalidate: 0 } // Always revalidate to get the latest follow status
  });

  if (!response.ok) {
    throw new Error('Failed to check follow status');
  }

  const data = await response.json();
  return data.isFollowing;
}
