// Comments API endpoints for Swagger documentation
export const commentsEndpoints = {
  '/api/comments': {
    get: {
      summary: 'Get comments',
      description: 'Retrieve comments with optional filtering',
      tags: ['Comments'],
      parameters: [
        {
          name: 'postId',
          in: 'query',
          description: 'Filter by post ID',
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
          schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
      ],
      responses: {
        200: {
          description: 'List of comments',
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
      summary: 'Create a comment',
      description: 'Create a new comment on a post (requires authentication)',
      tags: ['Comments'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'Comment content' },
                postId: { type: 'string', description: 'Post ID to comment on' },
                parentId: { type: 'string', nullable: true, description: 'Parent comment ID for replies' },
              },
              required: ['content', 'postId'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Comment created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Comment' },
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
  '/api/comments/{id}': {
    put: {
      summary: 'Update a comment',
      description: 'Update an existing comment (requires authentication)',
      tags: ['Comments'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Comment ID',
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
                content: { type: 'string', description: 'Updated comment content' },
              },
              required: ['content'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Comment updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Comment' },
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
          description: 'Not authorized to update this comment',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Comment not found',
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
      summary: 'Delete a comment',
      description: 'Delete an existing comment (requires authentication)',
      tags: ['Comments'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Comment ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Comment deleted successfully',
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
          description: 'Not authorized to delete this comment',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: 'Comment not found',
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
  '/api/comments/{id}/like': {
    post: {
      summary: 'Like/unlike a comment',
      description: 'Toggle like status for a comment (requires authentication)',
      tags: ['Comments', 'Interactions'],
      security: [{ sessionAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Comment ID',
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
          description: 'Comment not found',
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
