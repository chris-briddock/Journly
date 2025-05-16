import { GET as GET_USER, PATCH } from '@/app/api/users/[id]/route';
import { GET as SEARCH_USERS } from '@/app/api/users/search/route';
import {
  createMockNextRequest,
  createMockSession,
  MockRequestOptions
} from '../../utils/api-test-utils';
import prisma from '@/lib/prisma';

// Mock the modules
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

// Import the mocked auth after mocking
import * as authModule from '@/lib/auth';

describe('Users API', () => {
  // Get the mocked auth function
  const mockAuth = authModule.auth as jest.Mock;
  const mockPrismaFindUnique = prisma.user.findUnique as jest.Mock;
  const mockPrismaFindMany = prisma.user.findMany as jest.Mock;
  const mockPrismaUpdate = prisma.user.update as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/[id]', () => {
    it('returns a user by ID', async () => {
      // Setup mock data
      const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        bio: 'Test bio',
        location: 'Test location',
        followerCount: 5,
        followingCount: 10,
        postCount: 20,
        createdAt: new Date(),
      };
      mockPrismaFindUnique.mockResolvedValueOnce(mockUser);

      // Create request
      const request = createMockNextRequest({
        url: '/api/users/user-1',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await GET_USER(request, { params });
      const data = await response.json();

      // Verify prisma was called with correct parameters
      expect(mockPrismaFindUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'user-1' }
      }));

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
    });

    it('returns 404 if user not found', async () => {
      // Setup mock to return null (user not found)
      mockPrismaFindUnique.mockResolvedValueOnce(null);

      // Create request
      const request = createMockNextRequest({
        url: '/api/users/non-existent-user',
      });

      // Mock params
      const params = Promise.resolve({ id: 'non-existent-user' });

      // Call the API
      const response = await GET_USER(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('handles errors gracefully', async () => {
      // Setup mock to throw an error
      mockPrismaFindUnique.mockRejectedValueOnce(new Error('Database error'));

      // Create request
      const request = createMockNextRequest({
        url: '/api/users/user-1',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await GET_USER(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PATCH /api/users/[id]', () => {
    /**
     * Interface for user update request data
     */
    interface UserUpdateData {
      name?: string;
      bio?: string;
      location?: string;
      image?: string | null;
    }

    // Helper function to setup a PATCH request
    const setupPatchRequest = (data: UserUpdateData, options: Partial<MockRequestOptions> = {}) => ({
      method: 'PATCH',
      url: '/api/users/user-1',
      body: data,
      ...options
    });

    it('requires authentication', async () => {
      // Mock no session
      mockAuth.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest(setupPatchRequest({
        name: 'Updated Name',
        bio: 'Updated bio'
      }));

      // Mock params
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await PATCH(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });

    it('prevents updating other users profiles', async () => {
      // Mock authenticated session with different user ID
      const mockUser = { id: 'different-user', name: 'Different User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Create mock request
      const request = createMockNextRequest(setupPatchRequest({
        name: 'Updated Name',
        bio: 'Updated bio'
      }));

      // Mock params
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await PATCH(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(403);
      expect(data).toHaveProperty('error');
    });

    it('updates a user profile when authenticated as that user', async () => {
      // Mock authenticated session with matching user ID
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock user update
      const updatedUser = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'test@example.com',
        image: null,
        bio: 'Updated bio',
        location: 'Updated location',
        followerCount: 5,
        followingCount: 10,
        postCount: 20,
        createdAt: new Date(),
      };
      mockPrismaUpdate.mockResolvedValueOnce(updatedUser);

      // Create mock request
      const request = createMockNextRequest(setupPatchRequest({
        name: 'Updated Name',
        bio: 'Updated bio',
        location: 'Updated location'
      }));

      // Mock params
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await PATCH(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual(expect.objectContaining({
        bio: 'Updated bio',
        location: 'Updated location'
      }));
    });
  });

  describe('GET /api/users/search', () => {
    it('searches users by query', async () => {
      // Setup mock data
      const mockUsers = [
        { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: null },
        { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com', image: null }
      ];
      mockPrismaFindMany.mockResolvedValueOnce(mockUsers);

      // Create request with search query
      const request = createMockNextRequest({
        url: '/api/users/search?q=doe&limit=10',
      });

      // Call the API
      const response = await SEARCH_USERS(request);
      const data = await response.json();

      // Verify prisma was called with correct parameters
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { name: { contains: 'doe', mode: 'insensitive' } },
            { email: { contains: 'doe', mode: 'insensitive' } }
          ])
        }),
        take: 10
      }));

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toHaveProperty('id', 'user-1');
      expect(data[0]).toHaveProperty('label', 'John Doe');
    });

    it('returns all users when no query is provided', async () => {
      // Setup mock data
      const mockUsers = [
        { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: null },
        { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com', image: null }
      ];
      mockPrismaFindMany.mockResolvedValueOnce(mockUsers);

      // Create request without search query
      const request = createMockNextRequest({
        url: '/api/users/search',
      });

      // Call the API
      const response = await SEARCH_USERS(request);
      const data = await response.json();

      // Verify prisma was called with correct parameters
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object),
        take: 10
      }));

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it('handles errors gracefully', async () => {
      // Setup mock to throw an error
      mockPrismaFindMany.mockRejectedValueOnce(new Error('Database error'));

      // Create request
      const request = createMockNextRequest({
        url: '/api/users/search?q=test',
      });

      // Call the API
      const response = await SEARCH_USERS(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
