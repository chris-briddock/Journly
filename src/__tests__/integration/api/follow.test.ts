import { POST } from '@/app/api/users/[id]/follow/route';
import { GET } from '@/app/api/users/[id]/is-following/route';
import {
  createMockNextRequest,
  createMockSession,
} from '../../utils/api-test-utils';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Define types for the mocked Prisma client
type MockedPrismaFollow = {
  findUnique: jest.Mock;
  create: jest.Mock;
  delete: jest.Mock;
};

type MockedPrismaUser = {
  findUnique: jest.Mock;
  update: jest.Mock;
};

type MockedPrismaClient = Partial<PrismaClient> & {
  follow: MockedPrismaFollow;
  user: MockedPrismaUser;
  $transaction: jest.Mock;
};

// Mock the modules
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}));

// Import the mocked auth after mocking
import * as authModule from '@/lib/auth';

describe('Follow API', () => {
  // Get the mocked auth function
  const mockAuth = authModule.auth as jest.Mock;
  const mockPrismaFindUnique = prisma.user.findUnique as jest.Mock;
  const mockPrismaFollowFindUnique = jest.fn();
  const mockPrismaFollowCreate = jest.fn();
  const mockPrismaFollowDelete = jest.fn();
  const mockPrismaUserUpdate = jest.fn();
  const mockPrismaTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup prisma mocks
    // Use double casting through unknown to avoid type compatibility issues
    (prisma.follow as unknown as MockedPrismaFollow) = {
      findUnique: mockPrismaFollowFindUnique,
      create: mockPrismaFollowCreate,
      delete: mockPrismaFollowDelete
    };

    // Use double casting for user.update
    ((prisma.user as unknown) as MockedPrismaUser).update = mockPrismaUserUpdate;

    // Use double casting for $transaction
    ((prisma as unknown) as MockedPrismaClient).$transaction = mockPrismaTransaction;
  });

  describe('POST /api/users/[id]/follow', () => {
    it('requires authentication', async () => {
      // Mock no session
      mockAuth.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest({
        method: 'POST',
        url: '/api/users/user-2/follow',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await POST(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });

    it('prevents following yourself', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Create mock request
      const request = createMockNextRequest({
        method: 'POST',
        url: '/api/users/user-1/follow',
      });

      // Mock params (same as authenticated user)
      const params = Promise.resolve({ id: 'user-1' });

      // Call the API
      const response = await POST(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      // The actual implementation returns 400 for trying to follow yourself
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('checks if the user to follow exists', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock user lookup (user not found)
      mockPrismaFindUnique.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest({
        method: 'POST',
        url: '/api/users/non-existent-user/follow',
      });

      // Mock params
      const params = Promise.resolve({ id: 'non-existent-user' });

      // Call the API
      const response = await POST(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('follows a user when not already following', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock user lookup (user found)
      mockPrismaFindUnique.mockResolvedValueOnce({ id: 'user-2', name: 'User to Follow' });

      // Mock follow lookup (not already following)
      mockPrismaFollowFindUnique.mockResolvedValueOnce(null);

      // Mock transaction success
      mockPrismaTransaction.mockResolvedValueOnce([
        { followerId: 'user-1', followingId: 'user-2' },
        { id: 'user-1', followingCount: 1 },
        { id: 'user-2', followerCount: 1 }
      ]);

      // Create mock request
      const request = createMockNextRequest({
        method: 'POST',
        url: '/api/users/user-2/follow',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await POST(request, { params });
      const data = await response.json();

      // Verify transaction was called
      expect(mockPrismaTransaction).toHaveBeenCalled();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({ following: true });
    });

    it('unfollows a user when already following', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock user lookup (user found)
      mockPrismaFindUnique.mockResolvedValueOnce({ id: 'user-2', name: 'User to Unfollow' });

      // Mock follow lookup (already following)
      mockPrismaFollowFindUnique.mockResolvedValueOnce({
        followerId: 'user-1',
        followingId: 'user-2'
      });

      // Mock transaction success
      mockPrismaTransaction.mockResolvedValueOnce([
        { followerId: 'user-1', followingId: 'user-2' },
        { id: 'user-1', followingCount: 0 },
        { id: 'user-2', followerCount: 0 }
      ]);

      // Create mock request
      const request = createMockNextRequest({
        method: 'POST',
        url: '/api/users/user-2/follow',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await POST(request, { params });
      const data = await response.json();

      // Verify transaction was called
      expect(mockPrismaTransaction).toHaveBeenCalled();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({ following: false });
    });
  });

  describe('GET /api/users/[id]/is-following', () => {
    it('returns false when not authenticated', async () => {
      // Mock no session
      mockAuth.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest({
        url: '/api/users/user-2/is-following',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await GET(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({ isFollowing: false });
    });

    it('returns true when following the user', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock follow lookup (following)
      mockPrismaFollowFindUnique.mockResolvedValueOnce({
        followerId: 'user-1',
        followingId: 'user-2'
      });

      // Create mock request
      const request = createMockNextRequest({
        url: '/api/users/user-2/is-following',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await GET(request, { params });
      const data = await response.json();

      // Verify prisma was called
      expect(mockPrismaFollowFindUnique).toHaveBeenCalled();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({ isFollowing: true });
    });

    it('returns false when not following the user', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock follow lookup (not following)
      mockPrismaFollowFindUnique.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest({
        url: '/api/users/user-2/is-following',
      });

      // Mock params
      const params = Promise.resolve({ id: 'user-2' });

      // Call the API
      const response = await GET(request, { params });
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual({ isFollowing: false });
    });
  });
});
