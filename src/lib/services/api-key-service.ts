import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: Date;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // Only returned once during creation
  keyPrefix: string;
  permissions: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Generate a secure API key
 */
function generateApiKey(): { key: string; keyPrefix: string } {
  // Generate a random key with prefix
  const randomPart = randomBytes(32).toString('hex');
  const key = `sk_${randomPart}`;
  const keyPrefix = key.substring(0, 12) + '...'; // Show first 12 chars

  return { key, keyPrefix };
}

/**
 * Hash an API key for storage
 */
async function hashApiKey(key: string): Promise<string> {
  return bcrypt.hash(key, 12);
}

/**
 * Verify an API key against its hash
 */
async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}

/**
 * Create a new API key for a user
 */
export async function createApiKey(
  userId: string,
  request: CreateApiKeyRequest
): Promise<CreateApiKeyResponse> {
  // Check if user already has 5 or more API keys (limit)
  const existingKeysCount = await prisma.apiKey.count({
    where: {
      userId,
      isActive: true,
    },
  });

  if (existingKeysCount >= 5) {
    throw new Error('Maximum of 5 API keys allowed per user');
  }

  // Generate the API key
  const { key, keyPrefix } = generateApiKey();
  const hashedKey = await hashApiKey(key);

  // Create the API key in database
  const apiKey = await prisma.apiKey.create({
    data: {
      name: request.name,
      key: hashedKey,
      keyPrefix,
      permissions: ['posts:create'], // Only allow post creation
      expiresAt: request.expiresAt,
      userId,
    },
  });

  return {
    id: apiKey.id,
    name: apiKey.name,
    key, // Return the plain key only once
    keyPrefix: apiKey.keyPrefix,
    permissions: apiKey.permissions,
    expiresAt: apiKey.expiresAt,
    createdAt: apiKey.createdAt,
  };
}

/**
 * Get all API keys for a user (without the actual key values)
 */
export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return apiKeys.map(key => ({
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    permissions: key.permissions,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
    expiresAt: key.expiresAt,
    isActive: key.isActive,
  }));
}

/**
 * Validate an API key and return user info if valid
 */
export async function validateApiKey(apiKey: string): Promise<{ userId: string; permissions: string[] } | null> {
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return null;
  }

  // Find all active API keys (we need to check against hashed versions)
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  // Check each key to find a match
  for (const dbKey of apiKeys) {
    const isValid = await verifyApiKey(apiKey, dbKey.key);
    if (isValid) {
      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: dbKey.id },
        data: { lastUsedAt: new Date() },
      });

      return {
        userId: dbKey.userId,
        permissions: dbKey.permissions,
      };
    }
  }

  return null;
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeApiKey(userId: string, keyId: string): Promise<void> {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      userId,
    },
  });

  if (!apiKey) {
    throw new Error('API key not found');
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(userId: string, keyId: string): Promise<void> {
  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      userId,
    },
  });

  if (!apiKey) {
    throw new Error('API key not found');
  }

  await prisma.apiKey.delete({
    where: { id: keyId },
  });
}

/**
 * Check if a user has permission for a specific action
 */
export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  return permissions.includes(requiredPermission);
}
