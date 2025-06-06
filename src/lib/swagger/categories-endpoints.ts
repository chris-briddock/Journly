// Categories API endpoints for Swagger documentation
export const categoriesEndpoints = {
  '/api/categories': {
    get: {
      summary: 'Get all categories',
      description: 'Retrieve a list of all categories',
      tags: ['Categories'],
      parameters: [
        {
          name: 'dashboard',
          in: 'query',
          description: 'Include admin-only categories (requires authentication)',
          required: false,
          schema: { type: 'boolean', default: false },
        },
      ],
      responses: {
        200: {
          description: 'List of categories',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Category' },
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
    post: {
      summary: 'Create a new category',
      description: 'Create a new category (admin only)',
      tags: ['Categories'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Category created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
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
  '/api/categories/{id}': {
    get: {
      summary: 'Get a specific category',
      description: 'Retrieve a single category by ID',
      tags: ['Categories'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Category ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Category details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
            },
          },
        },
        404: {
          description: 'Category not found',
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
      summary: 'Update a category',
      description: 'Update an existing category (admin only)',
      tags: ['Categories'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Category ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Category updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' },
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
        404: {
          description: 'Category not found',
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
      summary: 'Delete a category',
      description: 'Delete an existing category (admin only)',
      tags: ['Categories'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Category ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Category deleted successfully',
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
          description: 'Admin access required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Category not found',
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
  '/api/categories/popular': {
    get: {
      summary: 'Get popular categories',
      description: 'Retrieve categories with the most posts',
      tags: ['Categories'],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of categories to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'Popular categories',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Category' },
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
  '/api/categories/trending': {
    get: {
      summary: 'Get trending categories',
      description: 'Retrieve categories with recent activity',
      tags: ['Categories'],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: 'Number of categories to return',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
        },
        {
          name: 'days',
          in: 'query',
          description: 'Number of days to look back for trending',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 30, default: 7 },
        },
      ],
      responses: {
        200: {
          description: 'Trending categories',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Category' },
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
  '/api/categories/admin': {
    get: {
      summary: 'Get admin categories',
      description: 'Retrieve categories for admin management (admin only)',
      tags: ['Categories', 'Admin'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Admin categories',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Category' },
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
  '/api/categories/editor': {
    get: {
      summary: 'Get categories for editor',
      description: 'Retrieve categories for use in post editor',
      tags: ['Categories', 'Editor'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'dashboard',
          in: 'query',
          description: 'Whether this is a dashboard request',
          required: false,
          schema: { type: 'boolean', default: false },
        },
      ],
      responses: {
        200: {
          description: 'Editor categories',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Category' },
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
