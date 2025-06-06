import swaggerJSDoc from 'swagger-jsdoc';

// Import endpoint definitions
import { postsEndpoints } from './swagger/posts-endpoints';
import { authEndpoints } from './swagger/auth-endpoints';
import { categoriesEndpoints } from './swagger/categories-endpoints';
import { usersEndpoints } from './swagger/users-endpoints';
import { apiKeysEndpoints } from './swagger/api-keys-endpoints';
import { commentsEndpoints } from './swagger/comments-endpoints';
import { dashboardEndpoints } from './swagger/dashboard-endpoints';
import { miscEndpoints } from './swagger/misc-endpoints';
import { cronEndpoints } from './swagger/cron-endpoints';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Journly API',
      version: '1.0.0',
      description: 'A comprehensive blog platform API with authentication, posts, comments, and more.',
      contact: {
        name: 'Journly Support',
        email: 'contact@journly.site',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://journly.site' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'Session-based authentication using NextAuth.js',
        },
        apiKeyAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'API key authentication for programmatic access. Use "Bearer sk_..." in Authorization header.',
        },
        apiKeyHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key authentication via X-API-Key header',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
          required: ['error'],
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            image: { type: 'string', nullable: true },
            bio: { type: 'string', nullable: true },
            website: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            isVerified: { type: 'boolean' },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            excerpt: { type: 'string', nullable: true },
            featuredImage: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['draft', 'published', 'scheduled'] },
            publishedAt: { type: 'string', format: 'date-time', nullable: true },
            scheduledFor: { type: 'string', format: 'date-time', nullable: true },
            viewCount: { type: 'integer' },
            likeCount: { type: 'integer' },
            commentCount: { type: 'integer' },
            readingTime: { type: 'integer' },
            seoTitle: { type: 'string', nullable: true },
            seoDescription: { type: 'string', nullable: true },
            seoKeywords: { type: 'string', nullable: true },
            seoCanonicalUrl: { type: 'string', nullable: true },
            ogImage: { type: 'string', nullable: true },
            noIndex: { type: 'boolean' },
            author: { $ref: '#/components/schemas/User' },
            categories: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePostRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Post title' },
            content: { type: 'string', description: 'Post content in HTML format' },
            excerpt: { type: 'string', description: 'Post excerpt' },
            featuredImage: { type: 'string', description: 'Featured image URL' },
            status: { 
              type: 'string', 
              enum: ['draft', 'published', 'scheduled'],
              default: 'draft',
              description: 'Post status'
            },
            scheduledFor: { 
              type: 'string', 
              format: 'date-time',
              description: 'Schedule publication date (required if status is scheduled)'
            },
            categoryIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of category IDs'
            },
            seoTitle: { type: 'string', description: 'SEO title' },
            seoDescription: { type: 'string', description: 'SEO description' },
            seoKeywords: { type: 'string', description: 'SEO keywords' },
            seoCanonicalUrl: { type: 'string', description: 'SEO canonical URL' },
            ogImage: { type: 'string', description: 'Open Graph image URL' },
            noIndex: { type: 'boolean', description: 'Exclude from search indexing' },
          },
          required: ['title', 'content'],
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            postCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Category name' },
            description: { type: 'string', description: 'Category description' },
            color: { type: 'string', description: 'Category color (hex code)' },
          },
          required: ['name'],
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            likeCount: { type: 'integer' },
            author: { $ref: '#/components/schemas/User' },
            post: { $ref: '#/components/schemas/Post' },
            parent: { $ref: '#/components/schemas/Comment', nullable: true },
            replies: {
              type: 'array',
              items: { $ref: '#/components/schemas/Comment' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            isRead: { type: 'boolean' },
            data: { type: 'object', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            tier: { type: 'string', enum: ['free', 'member'] },
            status: { type: 'string', enum: ['active', 'inactive', 'cancelled'] },
            stripeCustomerId: { type: 'string', nullable: true },
            stripeSubscriptionId: { type: 'string', nullable: true },
            currentPeriodStart: { type: 'string', format: 'date-time', nullable: true },
            currentPeriodEnd: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        PostsResponse: {
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' },
            },
            pagination: { $ref: '#/components/schemas/Pagination' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            totalPosts: { type: 'integer' },
            totalViews: { type: 'integer' },
            totalLikes: { type: 'integer' },
            totalComments: { type: 'integer' },
            publishedPosts: { type: 'integer' },
            draftPosts: { type: 'integer' },
            scheduledPosts: { type: 'integer' },
            followersCount: { type: 'integer' },
            followingCount: { type: 'integer' },
          },
        },
      },
    },
    paths: {
      // Merge all endpoint definitions
      ...postsEndpoints,
      ...authEndpoints,
      ...categoriesEndpoints,
      ...usersEndpoints,
      ...apiKeysEndpoints,
      ...commentsEndpoints,
      ...dashboardEndpoints,
      ...miscEndpoints,
      ...cronEndpoints,
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJSDoc(options);
