import { GET, POST } from '@/app/api/comments/route';
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

describe('Comments API', () => {
  // Get the mocked auth function
  const mockAuth = authModule.auth as jest.Mock;
  const mockPrismaFindMany = prisma.comment.findMany as jest.Mock;
  const mockPrismaCreate = prisma.comment.create as jest.Mock;
  const mockPrismaFindUnique = prisma.post.findUnique as jest.Mock;
  const mockPrismaCommentFindUnique = prisma.comment.findUnique as jest.Mock;
  const mockPrismaUpdate = prisma.post.update as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/comments', () => {
    it('requires a postId parameter', async () => {
      // Create request without postId
      const request = createMockNextRequest({
        url: '/api/comments',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('returns comments for a post', async () => {
      // Setup mock data
      const mockComments = [
        {
          id: '1',
          content: 'Great post!',
          author: { id: 'user-1', name: 'Test User', image: null }
        }
      ];
      mockPrismaFindMany.mockResolvedValueOnce(mockComments);

      // Create request with postId
      const request = createMockNextRequest({
        url: '/api/comments?postId=post-1',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Verify prisma was called with correct parameters
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { postId: 'post-1' }
      }));

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual(mockComments);
    });

    it('handles errors gracefully', async () => {
      // Setup mock to throw an error
      mockPrismaFindMany.mockRejectedValueOnce(new Error('Database error'));

      // Create request with postId
      const request = createMockNextRequest({
        url: '/api/comments?postId=post-1',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/comments', () => {
    /**
     * Interface for comment request data
     */
    interface CommentRequestData {
      postId?: string;
      content?: string;
      parentId?: string;
    }

    // Helper function to setup a POST request
    const setupPostRequest = (data: CommentRequestData, options: Partial<MockRequestOptions> = {}) => ({
      method: 'POST',
      url: '/api/comments',
      body: data,
      ...options
    });

    it('requires authentication', async () => {
      // Mock no session
      mockAuth.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        postId: 'post-1',
        content: 'This is a comment'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
    });

    it('validates required fields', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Create mock request with missing fields
      const request = createMockNextRequest(setupPostRequest({
        // Missing postId
        content: 'This is a comment'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('checks if the post exists', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock post lookup (post not found)
      mockPrismaFindUnique.mockResolvedValueOnce(null);

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        postId: 'non-existent-post',
        content: 'This is a comment'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('checks if the parent comment exists for replies', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock post lookup (post found)
      mockPrismaFindUnique.mockResolvedValueOnce({ id: 'post-1' });

      // Mock parent comment lookup (comment not found)
      mockPrismaCommentFindUnique.mockResolvedValueOnce(null);

      // Create mock request with parentId
      const request = createMockNextRequest(setupPostRequest({
        postId: 'post-1',
        content: 'This is a reply',
        parentId: 'non-existent-comment'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('creates a new comment when authenticated', async () => {
      // Mock authenticated session
      const mockUser = { id: 'user-1', name: 'Test User' };
      mockAuth.mockResolvedValueOnce(createMockSession({
        userId: mockUser.id,
        userName: mockUser.name
      }));

      // Mock post lookup (post found)
      mockPrismaFindUnique.mockResolvedValueOnce({ id: 'post-1' });

      // Mock comment creation
      const newComment = {
        id: 'comment-1',
        content: 'This is a comment',
        postId: 'post-1',
        authorId: 'user-1',
        author: { id: 'user-1', name: 'Test User', image: null }
      };
      mockPrismaCreate.mockResolvedValueOnce(newComment);

      // Mock post update
      mockPrismaUpdate.mockResolvedValueOnce({});

      // Create mock request
      const request = createMockNextRequest(setupPostRequest({
        postId: 'post-1',
        content: 'This is a comment'
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(data).toEqual(newComment);

      // Verify post comment count was updated
      expect(mockPrismaUpdate).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'post-1' },
        data: { commentCount: { increment: 1 } }
      }));
    });
  });
});
