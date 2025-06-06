// Cron job API endpoints for Swagger documentation
export const cronEndpoints = {
  '/api/cron/publish-scheduled': {
    post: {
      summary: 'Publish scheduled posts',
      description: 'Cron job to publish posts that are scheduled for publication (internal use)',
      tags: ['Cron Jobs'],
      responses: {
        200: {
          description: 'Scheduled posts published',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  published: { type: 'integer', description: 'Number of posts published' },
                  message: { type: 'string' },
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
  '/api/cron/reset-article-counts': {
    post: {
      summary: 'Reset article counts',
      description: 'Cron job to reset monthly article counts for free users (internal use)',
      tags: ['Cron Jobs'],
      responses: {
        200: {
          description: 'Article counts reset',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reset: { type: 'integer', description: 'Number of users reset' },
                  message: { type: 'string' },
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
};
