import { NextRequest } from 'next/server';
import { validateApiKey, hasPermission } from '@/lib/services/api-key-service';

export interface ApiKeyAuthResult {
  isValid: boolean;
  userId?: string;
  permissions?: string[];
  error?: string;
}

/**
 * Extract API key from request headers
 */
function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header: "Bearer jk_..."
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Authenticate request using API key
 */
export async function authenticateApiKey(
  request: NextRequest,
  requiredPermission?: string
): Promise<ApiKeyAuthResult> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key required. Provide it in Authorization header as "Bearer sk_..." or X-API-Key header.',
    };
  }

  try {
    const validation = await validateApiKey(apiKey);

    if (!validation) {
      return {
        isValid: false,
        error: 'Invalid or expired API key',
      };
    }

    // Check permissions if required
    if (requiredPermission && !hasPermission(validation.permissions, requiredPermission)) {
      return {
        isValid: false,
        error: `Insufficient permissions. Required: ${requiredPermission}`,
      };
    }

    return {
      isValid: true,
      userId: validation.userId,
      permissions: validation.permissions,
    };
  } catch (error) {
    console.error('API key authentication error:', error);
    return {
      isValid: false,
      error: 'Authentication failed',
    };
  }
}
