// Users API endpoints for Swagger documentation
export const usersEndpoints = {
  '/api/users/{id}': {
    get: {
      summary: 'Get user profile',
      description: 'Retrieve public user profile information',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'User profile',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/api/users/{id}/posts': {
    get: {
      summary: 'Get user posts',
      description: 'Retrieve posts by a specific user',
      tags: ['Users', 'Posts'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
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
          description: 'Posts per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by post status',
          required: false,
          schema: { type: 'string', enum: ['draft', 'published', 'scheduled'], default: 'published' },
        },
      ],
      responses: {
        200: {
          description: 'User posts',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  posts: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Post' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/api/users/{id}/follow': {
    post: {
      summary: 'Follow/unfollow user',
      description: 'Toggle follow status for a user',
      tags: ['Users', 'Social'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to follow/unfollow',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Follow status updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  following: { type: 'boolean' },
                  followerCount: { type: 'integer' },
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
          description: 'User not found',
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
  '/api/users/{id}/followers': {
    get: {
      summary: 'Get user followers',
      description: 'Retrieve list of users following the specified user',
      tags: ['Users', 'Social'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
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
          description: 'Users per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'User followers',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  followers: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/api/users/{id}/following': {
    get: {
      summary: 'Get users being followed',
      description: 'Retrieve list of users that the specified user is following',
      tags: ['Users', 'Social'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
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
          description: 'Users per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'Users being followed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  following: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/api/users/search': {
    get: {
      summary: 'Search users',
      description: 'Search for users by name or email',
      tags: ['Users'],
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: true,
          description: 'Search query',
          schema: { type: 'string', minLength: 2 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of results to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  users: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid search query',
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
  '/api/users/{id}/activity': {
    get: {
      summary: 'Get user activity',
      description: 'Get user activity feed',
      tags: ['Users', 'Activity'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID',
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
          description: 'Activities per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'User activity',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  activities: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['post_created', 'post_liked', 'comment_created', 'user_followed'] },
                        description: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        data: { type: 'object', nullable: true },
                      },
                    },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                },
              },
            },
          },
        },
        404: {
          description: 'User not found',
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
  '/api/users/{id}/is-following': {
    get: {
      summary: 'Check if following user',
      description: 'Check if current user is following the specified user',
      tags: ['Users', 'Social'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'User ID to check',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Following status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isFollowing: { type: 'boolean' },
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
          description: 'User not found',
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
  '/api/users/article-count': {
    get: {
      summary: 'Get user article count',
      description: 'Get current user article count for the month',
      tags: ['Users', 'Articles'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Article count',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  count: { type: 'integer' },
                  limit: { type: 'integer' },
                  remaining: { type: 'integer' },
                  resetDate: { type: 'string', format: 'date-time' },
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
  '/api/users/article-reset-check': {
    get: {
      summary: 'Check article reset status',
      description: 'Check if user article count needs to be reset',
      tags: ['Users', 'Articles'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Reset check result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  needsReset: { type: 'boolean' },
                  lastReset: { type: 'string', format: 'date-time', nullable: true },
                  nextReset: { type: 'string', format: 'date-time' },
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
  '/api/users/reset-article-count': {
    post: {
      summary: 'Reset user article count',
      description: 'Reset current user article count (admin only)',
      tags: ['Users', 'Articles', 'Admin'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Article count reset',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  newCount: { type: 'integer' },
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
          description: 'Admin access required',
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
  '/api/user/notification-preferences': {
    get: {
      summary: 'Get notification preferences',
      description: 'Get user notification preferences',
      tags: ['Users', 'Notifications'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Notification preferences',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  emailNotifications: { type: 'boolean' },
                  pushNotifications: { type: 'boolean' },
                  commentNotifications: { type: 'boolean' },
                  likeNotifications: { type: 'boolean' },
                  followNotifications: { type: 'boolean' },
                  mentionNotifications: { type: 'boolean' },
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
    put: {
      summary: 'Update notification preferences',
      description: 'Update user notification preferences',
      tags: ['Users', 'Notifications'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                emailNotifications: { type: 'boolean' },
                pushNotifications: { type: 'boolean' },
                commentNotifications: { type: 'boolean' },
                likeNotifications: { type: 'boolean' },
                followNotifications: { type: 'boolean' },
                mentionNotifications: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Preferences updated',
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
  '/api/user/password': {
    put: {
      summary: 'Update user password',
      description: 'Update current user password',
      tags: ['Users', 'Authentication'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                currentPassword: { type: 'string', description: 'Current password' },
                newPassword: { type: 'string', minLength: 8, description: 'New password' },
              },
              required: ['currentPassword', 'newPassword'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password updated successfully',
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
        400: {
          description: 'Invalid current password',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
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
