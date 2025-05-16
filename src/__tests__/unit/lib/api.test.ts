import * as api from '@/lib/api';
import { getApiUrl } from '@/lib/getApiUrl';

// Mock the getApiUrl function
jest.mock('@/lib/getApiUrl', () => ({
  getApiUrl: jest.fn((path) => `https://example.com${path}`),
}));

// Mock the global fetch function
global.fetch = jest.fn();

describe('API Client Functions', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('getPosts', () => {
    it('fetches posts with default parameters', async () => {
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [], total: 0 }),
      });

      // Call the function with default parameters
      const result = await api.getPosts({});

      // Check that fetch was called with the correct URL
      expect(getApiUrl).toHaveBeenCalledWith('/api/posts?page=1&limit=10');
      expect(fetch).toHaveBeenCalledWith('https://example.com/api/posts?page=1&limit=10', {
        next: { revalidate: 60 },
      });

      // Check the result
      expect(result).toEqual({ posts: [], total: 0 });
    });

    it('fetches posts with custom parameters', async () => {
      // Mock successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: [], total: 0 }),
      });

      // Call the function with custom parameters
      const result = await api.getPosts({
        page: 2,
        limit: 20,
        categoryId: 'cat-1',
        authorId: 'user-1',
        status: 'published',
        q: 'search term',
      });

      // Check that fetch was called with the correct URL
      expect(getApiUrl).toHaveBeenCalledWith(
        '/api/posts?page=2&limit=20&categoryId=cat-1&authorId=user-1&status=published&q=search+term'
      );
      expect(fetch).toHaveBeenCalledWith(
        'https://example.com/api/posts?page=2&limit=20&categoryId=cat-1&authorId=user-1&status=published&q=search+term',
        { next: { revalidate: 60 } }
      );

      // Check the result
      expect(result).toEqual({ posts: [], total: 0 });
    });

    it('throws an error when the fetch fails', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Call the function and expect it to throw
      await expect(api.getPosts({})).rejects.toThrow('Failed to fetch posts');
    });
  });

  describe('getPost', () => {
    it('fetches a post by ID', async () => {
      // Mock successful response
      const mockPost = { id: 'post-1', title: 'Test Post' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPost,
      });

      // Call the function
      const result = await api.getPost('post-1');

      // Check that fetch was called with the correct URL
      expect(getApiUrl).toHaveBeenCalledWith('/api/posts/post-1');
      expect(fetch).toHaveBeenCalledWith('https://example.com/api/posts/post-1', {
        next: { revalidate: 60 },
      });

      // Check the result
      expect(result).toEqual(mockPost);
    });

    it('returns null when the post is not found', async () => {
      // Mock 404 response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // Call the function
      const result = await api.getPost('non-existent');

      // Check the result
      expect(result).toBeNull();
    });

    it('throws an error for other failures', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Call the function and expect it to throw
      await expect(api.getPost('post-1')).rejects.toThrow('Failed to fetch post');
    });
  });

  // Add similar tests for other API functions
  // For brevity, I'll add just one more example

  describe('searchUsers', () => {
    it('searches users with default parameters', async () => {
      // Mock successful response
      const mockUsers = [{ id: 'user-1', name: 'Test User' }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      // Call the function with default parameters
      const result = await api.searchUsers();

      // Check that fetch was called with the correct URL
      expect(getApiUrl).toHaveBeenCalledWith('/api/users/search?limit=10');
      expect(fetch).toHaveBeenCalledWith('https://example.com/api/users/search?limit=10', {
        next: { revalidate: 0 },
      });

      // Check the result
      expect(result).toEqual(mockUsers);
    });

    it('searches users with custom parameters', async () => {
      // Mock successful response
      const mockUsers = [{ id: 'user-1', name: 'Test User' }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      // Call the function with custom parameters
      const result = await api.searchUsers('test', 5);

      // Check that fetch was called with the correct URL
      expect(getApiUrl).toHaveBeenCalledWith('/api/users/search?q=test&limit=5');
      expect(fetch).toHaveBeenCalledWith('https://example.com/api/users/search?q=test&limit=5', {
        next: { revalidate: 0 },
      });

      // Check the result
      expect(result).toEqual(mockUsers);
    });

    it('throws an error when the fetch fails', async () => {
      // Mock failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Call the function and expect it to throw
      await expect(api.searchUsers()).rejects.toThrow('Failed to search users');
    });
  });
});
