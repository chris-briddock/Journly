// Dashboard and Analytics API endpoints for Swagger documentation
export const dashboardEndpoints = {
  '/api/dashboard/stats': {
    get: {
      summary: 'Get dashboard statistics',
      description: 'Retrieve dashboard statistics for the authenticated user',
      tags: ['Dashboard'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Dashboard statistics',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DashboardStats' },
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
  '/api/dashboard/recent-posts': {
    get: {
      summary: 'Get recent posts for dashboard',
      description: 'Retrieve recent posts for the authenticated user dashboard',
      tags: ['Dashboard'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of posts to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
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
  '/api/analytics/engagement': {
    get: {
      summary: 'Get engagement analytics',
      description: 'Retrieve user engagement analytics',
      tags: ['Analytics'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'period',
          in: 'query',
          description: 'Time period for analytics',
          required: false,
          schema: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' },
        },
      ],
      responses: {
        200: {
          description: 'Engagement analytics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  period: { type: 'string' },
                  totalViews: { type: 'integer' },
                  totalLikes: { type: 'integer' },
                  totalComments: { type: 'integer' },
                  totalShares: { type: 'integer' },
                  engagementRate: { type: 'number', format: 'float' },
                  dailyStats: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string', format: 'date' },
                        views: { type: 'integer' },
                        likes: { type: 'integer' },
                        comments: { type: 'integer' },
                        shares: { type: 'integer' },
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
  '/api/analytics/posts': {
    get: {
      summary: 'Get post analytics',
      description: 'Retrieve detailed analytics for user posts',
      tags: ['Analytics'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'period',
          in: 'query',
          description: 'Time period for analytics',
          required: false,
          schema: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' },
        },
        {
          name: 'postId',
          in: 'query',
          description: 'Specific post ID for detailed analytics',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Post analytics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  period: { type: 'string' },
                  totalPosts: { type: 'integer' },
                  averageViews: { type: 'number', format: 'float' },
                  averageLikes: { type: 'number', format: 'float' },
                  averageComments: { type: 'number', format: 'float' },
                  topPosts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        views: { type: 'integer' },
                        likes: { type: 'integer' },
                        comments: { type: 'integer' },
                        publishedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  categoryBreakdown: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        categoryName: { type: 'string' },
                        postCount: { type: 'integer' },
                        totalViews: { type: 'integer' },
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
