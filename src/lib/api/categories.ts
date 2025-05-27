import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { Category } from '@/types/models/category';

export interface CategoryFilters extends Record<string, string | number | boolean | undefined> {
  dashboard?: boolean;
}

/**
 * Fetch all categories
 */
export function fetchCategories(filters: CategoryFilters = {}): Promise<Category[]> {
  return apiGet<Category[]>('/api/categories', filters);
}

/**
 * Fetch a single category by ID
 */
export function fetchCategory(id: string): Promise<Category> {
  return apiGet<Category>(`/api/categories/${id}`);
}

/**
 * Fetch popular categories
 */
export function fetchPopularCategories(limit: number = 10): Promise<Category[]> {
  return apiGet<Category[]>('/api/categories/popular', { limit });
}

/**
 * Fetch trending categories
 */
export function fetchTrendingCategories(limit: number = 10): Promise<Category[]> {
  return apiGet<Category[]>('/api/categories/trending', { limit });
}

/**
 * Fetch admin categories with post counts
 */
export function fetchAdminCategories(filters: CategoryFilters = {}): Promise<Category[]> {
  return apiGet<Category[]>('/api/categories/admin', filters);
}

/**
 * Create a new category
 */
export function createCategory(data: Partial<Category>): Promise<Category> {
  return apiPost<Category>('/api/categories', data);
}

/**
 * Update a category
 */
export function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return apiPut<Category>(`/api/categories/${id}`, data);
}

/**
 * Delete a category
 */
export function deleteCategory(id: string): Promise<void> {
  return apiDelete<void>(`/api/categories/${id}`);
}
