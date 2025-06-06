// Miscellaneous API endpoints for Swagger documentation
export const miscEndpoints = {
  '/api/register': {
    post: {
      summary: 'Register new user',
      description: 'Create a new user account',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'User full name' },
                email: { type: 'string', format: 'email', description: 'User email address' },
                password: { type: 'string', minLength: 8, description: 'User password' },
              },
              required: ['name', 'email', 'password'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid input or user already exists',
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
  '/api/bookmarks': {
    get: {
      summary: 'Get user bookmarks',
      description: 'Retrieve bookmarked posts for the authenticated user',
      tags: ['Bookmarks'],
      security: [{ sessionAuth: [] }],
      parameters: [
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
          description: 'Bookmarks per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'User bookmarks',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bookmarks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        post: { $ref: '#/components/schemas/Post' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
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
  '/api/notifications': {
    get: {
      summary: 'Get user notifications',
      description: 'Retrieve notifications for the authenticated user',
      tags: ['Notifications'],
      security: [{ sessionAuth: [] }],
      parameters: [
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
          description: 'Notifications per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
        {
          name: 'unreadOnly',
          in: 'query',
          description: 'Show only unread notifications',
          required: false,
          schema: { type: 'boolean', default: false },
        },
      ],
      responses: {
        200: {
          description: 'User notifications',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notifications: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Notification' },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
                  unreadCount: { type: 'integer' },
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
  '/api/notifications/mark-read': {
    post: {
      summary: 'Mark notifications as read',
      description: 'Mark one or more notifications as read',
      tags: ['Notifications'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                notificationIds: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of notification IDs to mark as read',
                },
                markAllAsRead: {
                  type: 'boolean',
                  description: 'Mark all notifications as read (ignores notificationIds)',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Notifications marked as read',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  markedCount: { type: 'integer' },
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
  '/api/subscriptions': {
    get: {
      summary: 'Get user subscription',
      description: 'Retrieve subscription details for the authenticated user',
      tags: ['Subscriptions'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'User subscription',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Subscription' },
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
  '/api/subscriptions/checkout': {
    post: {
      summary: 'Create Stripe checkout session',
      description: 'Create a Stripe checkout session for subscription upgrade',
      tags: ['Subscriptions'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tier: { type: 'string', enum: ['member'], description: 'Subscription tier' },
                successUrl: { type: 'string', description: 'Success redirect URL' },
                cancelUrl: { type: 'string', description: 'Cancel redirect URL' },
              },
              required: ['tier'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Checkout session created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'Stripe checkout URL' },
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
  '/api/webhooks/stripe': {
    post: {
      summary: 'Stripe webhook',
      description: 'Handle Stripe webhook events for subscription management',
      tags: ['Webhooks'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: 'Stripe webhook event payload',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Webhook processed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  received: { type: 'boolean' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid webhook signature',
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
  '/api/subscriptions/billing-portal': {
    post: {
      summary: 'Create billing portal session',
      description: 'Create a Stripe billing portal session for subscription management',
      tags: ['Subscriptions'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Billing portal session created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'Stripe billing portal URL' },
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
  '/api/subscriptions/update-status': {
    post: {
      summary: 'Update subscription status',
      description: 'Update subscription status (internal use)',
      tags: ['Subscriptions'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User ID' },
                status: { type: 'string', enum: ['active', 'inactive', 'cancelled'], description: 'New status' },
              },
              required: ['userId', 'status'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Subscription status updated',
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
          description: 'Invalid request',
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
  '/api/profile': {
    get: {
      summary: 'Get user profile',
      description: 'Get current user profile information',
      tags: ['Profile'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'User profile',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
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
      summary: 'Update user profile',
      description: 'Update current user profile information',
      tags: ['Profile'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'User name' },
                bio: { type: 'string', description: 'User bio' },
                website: { type: 'string', description: 'User website' },
                location: { type: 'string', description: 'User location' },
                image: { type: 'string', description: 'Profile image URL' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
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
  '/api/reading-history': {
    get: {
      summary: 'Get reading history',
      description: 'Get user reading history',
      tags: ['Reading History'],
      security: [{ sessionAuth: [] }],
      parameters: [
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
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
        },
      ],
      responses: {
        200: {
          description: 'Reading history',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  history: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        post: { $ref: '#/components/schemas/Post' },
                        readAt: { type: 'string', format: 'date-time' },
                        readingProgress: { type: 'number', description: 'Reading progress percentage' },
                      },
                    },
                  },
                  pagination: { $ref: '#/components/schemas/Pagination' },
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
  '/api/recommendations': {
    get: {
      summary: 'Get post recommendations',
      description: 'Get personalized post recommendations for the user',
      tags: ['Recommendations'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of recommendations',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Post recommendations',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  recommendations: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Post' },
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
