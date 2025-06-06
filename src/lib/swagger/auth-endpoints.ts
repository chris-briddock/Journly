// Authentication API endpoints for Swagger documentation
export const authEndpoints = {
  '/api/auth/2fa/setup': {
    post: {
      summary: 'Setup 2FA',
      description: 'Initialize two-factor authentication setup',
      tags: ['Authentication', '2FA'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: '2FA setup initiated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  qrCode: { type: 'string', description: 'QR code data URL' },
                  secret: { type: 'string', description: 'TOTP secret' },
                  backupCodes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Backup codes for recovery',
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
  '/api/auth/2fa/verify-setup': {
    post: {
      summary: 'Verify 2FA setup',
      description: 'Complete two-factor authentication setup by verifying TOTP token',
      tags: ['Authentication', '2FA'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string', description: 'TOTP token from authenticator app' },
              },
              required: ['token'],
            },
          },
        },
      },
      responses: {
        200: {
          description: '2FA setup completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid token',
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
  '/api/auth/2fa/verify': {
    post: {
      summary: 'Verify 2FA token',
      description: 'Verify two-factor authentication token during login',
      tags: ['Authentication', '2FA'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
                token: { type: 'string', description: 'TOTP token or backup code' },
              },
              required: ['email', 'token'],
            },
          },
        },
      },
      responses: {
        200: {
          description: '2FA verification successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid token or email',
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
  '/api/auth/2fa/disable': {
    post: {
      summary: 'Disable 2FA',
      description: 'Disable two-factor authentication for the user',
      tags: ['Authentication', '2FA'],
      security: [{ sessionAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password: { type: 'string', description: 'User password for confirmation' },
              },
              required: ['password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: '2FA disabled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid password',
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
  '/api/auth/2fa/backup-codes': {
    get: {
      summary: 'Get backup codes',
      description: 'Retrieve or regenerate 2FA backup codes',
      tags: ['Authentication', '2FA'],
      security: [{ sessionAuth: [] }],
      responses: {
        200: {
          description: 'Backup codes retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  backupCodes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of backup codes',
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
  '/api/auth/check-2fa': {
    post: {
      summary: 'Check 2FA status',
      description: 'Check if user has 2FA enabled',
      tags: ['Authentication', '2FA'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
              },
              required: ['email'],
            },
          },
        },
      },
      responses: {
        200: {
          description: '2FA status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  has2FA: { type: 'boolean', description: 'Whether user has 2FA enabled' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid email',
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
  '/api/auth/forgot-password': {
    post: {
      summary: 'Request password reset',
      description: 'Send password reset email to user',
      tags: ['Authentication', 'Password Reset'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
              },
              required: ['email'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset email sent',
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
          description: 'Invalid email',
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
  '/api/auth/reset-password': {
    post: {
      summary: 'Reset password',
      description: 'Reset user password with token',
      tags: ['Authentication', 'Password Reset'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string', description: 'Password reset token' },
                password: { type: 'string', minLength: 8, description: 'New password' },
              },
              required: ['token', 'password'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset successful',
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
          description: 'Invalid token or password',
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
  '/api/auth/check-user': {
    post: {
      summary: 'Check if user exists',
      description: 'Check if a user exists by email',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
              },
              required: ['email'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User check result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  exists: { type: 'boolean', description: 'Whether user exists' },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid email',
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
  '/api/auth/resend-verification': {
    post: {
      summary: 'Resend verification email',
      description: 'Resend email verification link to user',
      tags: ['Authentication', 'Email Verification'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', description: 'User email' },
              },
              required: ['email'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Verification email sent',
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
          description: 'Invalid email or user already verified',
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
  '/api/auth/verify-email': {
    post: {
      summary: 'Verify email address',
      description: 'Verify user email address with token',
      tags: ['Authentication', 'Email Verification'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: { type: 'string', description: 'Email verification token' },
              },
              required: ['token'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Email verified successfully',
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
          description: 'Invalid or expired token',
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
