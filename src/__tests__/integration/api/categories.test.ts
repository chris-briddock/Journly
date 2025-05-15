import { GET, POST } from '@/app/api/categories/route';
import { GET as GET_POPULAR } from '@/app/api/categories/popular/route';
import {
  createMockNextRequest,
  createMockSession,
  MockRequestOptions
} from '../../utils/api-test-utils';
import prisma from '@/lib/prisma';

// Define types for the category data
interface CategoryRequestData {
  name: string;
  description?: string;
  isDefault?: boolean;
}

// Define type for the mocked postCategory
interface MockedPostCategory {
  count: jest.Mock;
}

// Mock the modules
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

// Import the mocked auth after mocking
import * as authModule from '@/lib/auth';

describe('Categories API', () => {
  // Get the mocked auth function
  const mockAuth = authModule.auth as jest.Mock;
  const mockPrismaFindMany = prisma.category.findMany as jest.Mock;
  const mockPrismaCreate = prisma.category.create as jest.Mock;
  const mockPrismaFindUnique = prisma.user.findUnique as jest.Mock;
  const mockPrismaCategoryFindUnique = prisma.category.findUnique as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('returns all categories', async () => {
      // Setup mock data
      const mockCategories = [
        { id: '1', name: 'Technology', isDefault: true, postCount: 10 },
        { id: '2', name: 'Health', isDefault: false, postCount: 5 }
      ];
      mockPrismaFindMany.mockResolvedValueOnce(mockCategories);

      // Call the API
      const response = await GET();
      const data = await response.json();

      // Verify prisma was called
      expect(mockPrismaFindMany).toHaveBeenCalled();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockCategories);
    });

    it('handles errors gracefully', async () => {
      // Setup mock to throw an error
      mockPrismaFindMany.mockRejectedValueOnce(new Error('Database error'));

      // Call the API
      const response = await GET();
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/categories/popular', () => {
    const mockPostCategoryCount = jest.fn();

    beforeEach(() => {
      // Mock the postCategory.count method
      (prisma.postCategory as unknown as MockedPostCategory) = { count: mockPostCategoryCount };
    });

    it('returns popular categories with limit', async () => {
      // Setup mock data
      const mockCategories = [
        { id: '1', name: 'Technology', isDefault: true },
        { id: '2', name: 'Health', isDefault: false }
      ];
      mockPrismaFindMany.mockResolvedValueOnce(mockCategories);
      mockPostCategoryCount.mockResolvedValue(5); // Mock 5 posts for each category

      // Create request with limit
      const request = createMockNextRequest({
        url: '/api/categories/popular?limit=2',
      });

      // Call the API
      const response = await GET_POPULAR(request);
      const data = await response.json();

      // Verify prisma was called with correct limit
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        take: 2
      }));

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty('postCount', 5);
    });
  });

  describe('POST /api/categories', () => {
    // Helper function to setup a POST request
    const setupPostRequest = (data: CategoryRequestData, options: Partial<MockRequestOptions> = {}) => ({
      method: 'POST',
      url: '/api/categories',
      body: data,
      ...options
    });

    it('requires authentication', async () => {
      // Mock no session
      mockAuth.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        name: 'New Category',
        description: 'A new category'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });

    it('creates a new category when authenticated', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User', role: 'user' };
      mockAuth.mockResolvedValueOnce(createMockSession(mockUser));

      // Mock user lookup
      mockPrismaFindUnique.mockResolvedValueOnce({ ...mockUser });

      // Mock category check (no existing category)
      mockPrismaCategoryFindUnique.mockResolvedValueOnce(null);

      // Mock category creation
      const newCategory = {
        id: 'cat-1',
        name: 'New Category',
        description: 'A new category',
        isDefault: false,
        createdById: 'user-1'
      };
      mockPrismaCreate.mockResolvedValueOnce(newCategory);

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        name: 'New Category',
        description: 'A new category'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      expect(data).toEqual(newCategory);
    });

    it('prevents non-admins from creating default categories', async () => {
      // Mock authenticated session (non-admin)
      const mockUser = { id: 'user-1', name: 'Test User', role: 'user' };
      mockAuth.mockResolvedValueOnce(createMockSession(mockUser));

      // Mock user lookup
      mockPrismaFindUnique.mockResolvedValueOnce({ ...mockUser });

      // Create mock request with isDefault=true
      const request = createMockNextRequest(setupPostRequest({
        name: 'New Default Category',
        description: 'A new default category',
        isDefault: true
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
    });

    it('prevents creating categories with duplicate names', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User', role: 'user' };
      mockAuth.mockResolvedValueOnce(createMockSession(mockUser));

      // Mock user lookup
      mockPrismaFindUnique.mockResolvedValueOnce({ ...mockUser });

      // Mock category check (existing category)
      mockPrismaCategoryFindUnique.mockResolvedValueOnce({
        id: 'existing-cat',
        name: 'Existing Category'
      });

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        name: 'Existing Category',
        description: 'This category already exists'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });
});
