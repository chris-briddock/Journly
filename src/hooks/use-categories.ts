import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import {
  fetchCategories,
  fetchCategory,
  fetchPopularCategories,
  fetchTrendingCategories,
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFilters,
} from '@/lib/api/categories';
import { Category } from '@/types/models/category';

/**
 * Hook to fetch all categories
 */
export function useCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: () => fetchCategories(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
}

/**
 * Hook to fetch a single category
 */
export function useCategory(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => fetchCategory(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch popular categories
 */
export function usePopularCategories(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.categories.popular(limit),
    queryFn: () => fetchPopularCategories(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch trending categories
 */
export function useTrendingCategories(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.categories.trending(limit),
    queryFn: () => fetchTrendingCategories(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch admin categories with post counts
 */
export function useAdminCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.categories.admin(filters),
    queryFn: () => fetchAdminCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - admin data changes less frequently
  });
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.popular() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trending() });

      toast.success('Category created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create category. Please try again.');
      console.error('Create category error:', error);
    },
  });
}

/**
 * Hook to update a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategory(id, data),
    onSuccess: (updatedCategory, { id }) => {
      // Update the specific category in cache
      queryClient.setQueryData(queryKeys.categories.detail(id), updatedCategory);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.popular() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trending() });

      toast.success('Category updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update category. Please try again.');
      console.error('Update category error:', error);
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.popular() });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.trending() });

      toast.success('Category deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete category. Please try again.');
      console.error('Delete category error:', error);
    },
  });
}
