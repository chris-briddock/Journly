// Posts API endpoints for Swagger documentation
export const postsEndpoints = {
  '/api/posts': {
    get: {
      summary: 'Get all posts',
      description: 'Retrieve a paginated list of posts with optional filtering',
      tags: ['Posts'],
      parameters: [
        {
          name: 'q',
          in: 'query',
          description: 'Search query for title and content',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'categoryId',
          in: 'query',
          description: 'Filter by category ID',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'authorId',
          in: 'query',
          description: 'Filter by author ID',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by post status',
          required: false,
          schema: { type: 'string', enum: ['draft', 'published', 'scheduled'], default: 'published' },
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of posts per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'List of posts',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostsResponse' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    post: {
      summary: 'Create a new post',
      description: 'Create a new blog post (requires authentication via session or API key)',
      tags: ['Posts'],
      security: [
        { sessionAuth: [] },
        { apiKeyAuth: [] },
        { apiKeyHeader: [] },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePostRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Subscription required (free users limited to 1 post)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  subscriptionRequired: { type: 'boolean' },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}': {
    get: {
      summary: 'Get a specific post',
      description: 'Retrieve a single post by ID',
      tags: ['Posts'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    put: {
      summary: 'Update a post',
      description: 'Update an existing post (requires authentication)',
      tags: ['Posts'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePostRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Post updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Not authorized to update this post',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    delete: {
      summary: 'Delete a post',
      description: 'Delete an existing post (requires authentication)',
      tags: ['Posts'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Not authorized to delete this post',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/like': {
    post: {
      summary: 'Like/unlike a post',
      description: 'Toggle like status for a post (requires authentication)',
      tags: ['Posts', 'Interactions'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Like status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  liked: { type: 'boolean', description: 'Current like status' },
                  likeCount: { type: 'integer', description: 'Total number of likes' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/bookmark': {
    post: {
      summary: 'Bookmark/unbookmark a post',
      description: 'Toggle bookmark status for a post (requires authentication)',
      tags: ['Posts', 'Bookmarks'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Bookmark status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bookmarked: { type: 'boolean', description: 'Current bookmark status' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/access': {
    get: {
      summary: 'Check post access',
      description: 'Check if user has access to read a post (subscription-based)',
      tags: ['Posts', 'Access Control'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Access check result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  hasAccess: { type: 'boolean' },
                  reason: { type: 'string', nullable: true },
                  subscriptionRequired: { type: 'boolean' },
                },
              },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/bookmark-status': {
    get: {
      summary: 'Get bookmark status',
      description: 'Check if a post is bookmarked by the current user',
      tags: ['Posts', 'Bookmarks'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Bookmark status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bookmarked: { type: 'boolean' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/comments': {
    get: {
      summary: 'Get post comments',
      description: 'Retrieve comments for a specific post',
      tags: ['Posts', 'Comments'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Comments per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'Post comments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Comment' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/edit': {
    get: {
      summary: 'Get post for editing',
      description: 'Retrieve post data for editing (author only)',
      tags: ['Posts', 'Editor'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post data for editing',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Not authorized to edit this post',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/like-status': {
    get: {
      summary: 'Get like status',
      description: 'Check if a post is liked by the current user',
      tags: ['Posts', 'Interactions'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Like status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  liked: { type: 'boolean' },
                  likeCount: { type: 'integer' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/metadata': {
    get: {
      summary: 'Get post metadata',
      description: 'Retrieve SEO and metadata for a post',
      tags: ['Posts', 'SEO'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post metadata',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  keywords: { type: 'string' },
                  canonicalUrl: { type: 'string' },
                  ogImage: { type: 'string' },
                  noIndex: { type: 'boolean' },
                },
              },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/preview': {
    get: {
      summary: 'Preview post',
      description: 'Get post preview (for draft posts)',
      tags: ['Posts', 'Preview'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post preview',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Post' },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: 'Not authorized to preview this post',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/related': {
    get: {
      summary: 'Get related posts',
      description: 'Retrieve posts related to the specified post',
      tags: ['Posts', 'Recommendations'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of related posts to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        },
      ],
      responses: {
        200: {
          description: 'Related posts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  posts: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/{id}/view': {
    post: {
      summary: 'Record post view',
      description: 'Increment view count for a post',
      tags: ['Posts', 'Analytics'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Post ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'View recorded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  viewCount: { type: 'integer' },
                },
              },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/bulk-delete': {
    post: {
      summary: 'Bulk delete posts',
      description: 'Delete multiple posts at once (requires authentication)',
      tags: ['Posts', 'Bulk Operations'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                postIds: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of post IDs to delete',
                },
              },
              required: ['postIds'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Posts deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  deletedCount: { type: 'integer' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/recent': {
    get: {
      summary: 'Get recent posts',
      description: 'Retrieve recently published posts',
      tags: ['Posts'],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of posts to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Recent posts',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Post' },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/schedule': {
    post: {
      summary: 'Schedule post publication',
      description: 'Schedule a post for future publication',
      tags: ['Posts', 'Scheduling'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                postId: { type: 'string', description: 'Post ID to schedule' },
                scheduledFor: { type: 'string', format: 'date-time', description: 'Publication date and time' },
              },
              required: ['postId', 'scheduledFor'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Post scheduled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  scheduledFor: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Post not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/seo': {
    post: {
      summary: 'Generate SEO metadata',
      description: 'Generate SEO metadata for a post',
      tags: ['Posts', 'SEO'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Post title' },
                content: { type: 'string', description: 'Post content' },
              },
              required: ['title', 'content'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'SEO metadata generated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  seoTitle: { type: 'string' },
                  seoDescription: { type: 'string' },
                  seoKeywords: { type: 'string' },
                  readingTime: { type: 'integer' },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  '/api/posts/seo/analyze': {
    post: {
      summary: 'Analyze SEO for post',
      description: 'Analyze and provide SEO recommendations for a post',
      tags: ['Posts', 'SEO'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Post title' },
                content: { type: 'string', description: 'Post content' },
                seoTitle: { type: 'string', description: 'SEO title' },
                seoDescription: { type: 'string', description: 'SEO description' },
              },
              required: ['title', 'content'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'SEO analysis results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  score: { type: 'integer', description: 'SEO score out of 100' },
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        message: { type: 'string' },
                        severity: { type: 'string', enum: ['info', 'warning', 'error'] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        500: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
};
