import { NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/posts/route';
import {
  createMockNextRequest,
  createMockSession,
  MockRequestOptions
} from '../../utils/api-test-utils';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Mock the modules
jest.mock('@/lib/prisma');
jest.mock('@/lib/auth');

describe('Posts API', () => {
  const mockAuth = auth as jest.Mock;
  const mockPrismaFindMany = prisma.post.findMany as jest.Mock;
  const mockPrismaCount = prisma.post.count as jest.Mock;
  const mockPrismaTransaction = prisma.$transaction as jest.Mock;

  // Test data
  const testDate = new Date('2023-01-01T12:00:00Z');
  const mockPosts = [
    {
      id: 'post-1',
      title: 'Test Post 1',
      content: 'Test content 1',
      authorId: 'user-1',
      author: {
        id: 'user-1',
        name: 'Test User',
        image: null,
      },
      categories: [],
      createdAt: testDate,
      updatedAt: testDate,
      status: 'published',
      slug: 'test-post-1',
      excerpt: 'Test excerpt 1',
      featuredImage: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    },
    {
      id: 'post-2',
      title: 'Test Post 2',
      content: 'Test content 2',
      authorId: 'user-1',
      author: {
        id: 'user-1',
        name: 'Test User',
        image: null,
      },
      categories: [],
      createdAt: testDate,
      updatedAt: testDate,
      status: 'published',
      slug: 'test-post-2',
      excerpt: 'Test excerpt 2',
      featuredImage: null,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('returns posts with pagination', async () => {
      // Mock prisma responses
      mockPrismaFindMany.mockResolvedValue(mockPosts);
      mockPrismaCount.mockResolvedValue(2);

      // Create mock request
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=1&limit=10',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        posts: mockPosts,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      // Verify prisma was called with correct parameters
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      }));
    });

    it('handles filtering by category', async () => {
      // Mock prisma responses
      mockPrismaFindMany.mockResolvedValue([mockPosts[0]]);
      mockPrismaCount.mockResolvedValue(1);

      // Create mock request with category filter
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=1&limit=10&category=technology',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(1);
      expect(data.pagination.total).toBe(1);

      // Verify prisma was called with correct filter
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          categories: expect.objectContaining({
            some: expect.objectContaining({
              slug: 'technology'
            })
          })
        }),
      }));
    });

    it('handles search queries', async () => {
      // Mock prisma responses
      mockPrismaFindMany.mockResolvedValue([mockPosts[0]]);
      mockPrismaCount.mockResolvedValue(1);

      // Create mock request with search query
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts?page=1&limit=10&search=test',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.posts).toHaveLength(1);

      // Verify prisma was called with correct search parameters
      expect(mockPrismaFindMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: expect.objectContaining({ contains: 'test', mode: 'insensitive' }) },
            { content: expect.objectContaining({ contains: 'test', mode: 'insensitive' }) },
          ])
        }),
      }));
    });

    it('handles errors gracefully', async () => {
      // Mock prisma to throw an error
      mockPrismaFindMany.mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/posts',
      });

      // Call the API
      const response = await GET(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/posts', () => {
    // Setup for POST tests
    const validPostData = {
      title: 'New Post',
      content: 'New content',
      status: 'draft',
      categoryIds: ['cat-1', 'cat-2'],
      excerpt: 'Test excerpt',
      featuredImage: 'https://example.com/image.jpg',
    };

    const setupPostRequest = (body: unknown = validPostData, authenticated = true): MockRequestOptions => {
      // Mock authentication
      mockAuth.mockResolvedValue(
        authenticated
          ? createMockSession({ authenticated: true, userId: 'user-1' })
          : null
      );

      // Return request options
      return {
        method: 'POST',
        url: 'http://localhost:3000/api/posts',
        body,
      };
    };

    it('creates a new post when authenticated', async () => {
      // Mock transaction
      mockPrismaTransaction.mockImplementation(async (callback) => {
        const tx = {
          post: {
            create: jest.fn().mockResolvedValue({
              id: 'new-post-id',
              title: 'New Post',
              content: 'New content',
              authorId: 'user-1',
              slug: 'new-post',
              status: 'draft',
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          category: {
            findMany: jest.fn().mockResolvedValue([
              { id: 'cat-1', name: 'Category 1' },
              { id: 'cat-2', name: 'Category 2' },
            ]),
          },
          postCategory: {
            createMany: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(tx);
      });

      // Create mock request
      const request = createMockNextRequest(setupPostRequest(validPostData));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id', 'new-post-id');
      expect(data).toHaveProperty('slug', 'new-post');

      // Verify transaction was called
      expect(mockPrismaTransaction).toHaveBeenCalled();
    });

    it('returns 401 when not authenticated', async () => {
      // Create mock request (not authenticated)
      const request = createMockNextRequest(setupPostRequest(validPostData, false));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error', 'You must be logged in to create a post');

      // Verify transaction was not called
      expect(mockPrismaTransaction).not.toHaveBeenCalled();
    });

    it('validates required fields', async () => {
      // Create mock request with missing fields
      const request = createMockNextRequest(setupPostRequest({
        // Missing title and content
        status: 'draft',
      }));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('required');

      // Verify transaction was not called
      expect(mockPrismaTransaction).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      // Mock transaction to throw an error
      mockPrismaTransaction.mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = createMockNextRequest(setupPostRequest(validPostData));

      // Call the API
      const response = await POST(request);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
