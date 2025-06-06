// API Keys management endpoints for Swagger documentation
export const apiKeysEndpoints = {
  '/api/user/api-keys': {
    get: {
      summary: 'Get user API keys',
      description: 'Retrieve all API keys for the authenticated user',
      tags: ['API Keys'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'User API keys',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  apiKeys: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        keyPrefix: { type: 'string', description: 'First 12 characters of the key (sk_...)' },
                        permissions: { type: 'array', items: { type: 'string' } },
                        lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time', nullable: true },
                        isActive: { type: 'boolean' },
                      },
                    },
                  },
                  total: { type: 'integer' },
                  limit: { type: 'integer', description: 'Maximum number of keys allowed (5)' },
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
    post: {
      summary: 'Create API key',
      description: 'Create a new API key for programmatic access (limited to post creation)',
      tags: ['API Keys'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', maxLength: 50, description: 'Descriptive name for the API key' },
                expiresAt: { type: 'string', format: 'date-time', description: 'Optional expiration date' },
              },
              required: ['name'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'API key created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  key: { type: 'string', description: 'The actual API key (sk_...) - only shown once!' },
                  keyPrefix: { type: 'string', description: 'Display prefix for the key' },
                  permissions: { type: 'array', items: { type: 'string' }, description: 'Always ["posts:create"]' },
                  expiresAt: { type: 'string', format: 'date-time', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid request or limit reached (max 5 keys)',
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
  '/api/user/api-keys/{id}': {
    delete: {
      summary: 'Delete API key',
      description: 'Permanently delete an API key',
      tags: ['API Keys'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'API key ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'API key deleted successfully',
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
        404: {
          description: 'API key not found',
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
    patch: {
      summary: 'Revoke API key',
      description: 'Revoke (deactivate) an API key without deleting it',
      tags: ['API Keys'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'API key ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                action: { type: 'string', enum: ['revoke'], description: 'Action to perform' },
              },
              required: ['action'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'API key revoked successfully',
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
          description: 'Invalid action',
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
        404: {
          description: 'API key not found',
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
