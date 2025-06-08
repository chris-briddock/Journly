import prisma from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export interface SessionInfo {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  createdAt?: Date;
  lastAccessed?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  isCurrent?: boolean;
}

export interface LoginActivity {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'failed_login' | 'session_expired';
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
    isMobile?: boolean;
  };
  location?: {
    country?: string;
    city?: string;
  };
  timestamp: Date;
  success: boolean;
  details?: string;
}

/**
 * Parse user agent string to extract device information
 */
export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name ? `${result.browser.name} ${result.browser.version}` : undefined,
    os: result.os.name ? `${result.os.name} ${result.os.version}` : undefined,
    device: result.device.model || result.device.type || 'Desktop',
    isMobile: result.device.type === 'mobile' || result.device.type === 'tablet',
  };
}

/**
 * Get IP address from request headers
 */
export function getClientIP(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return undefined;
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string, currentSessionToken?: string): Promise<SessionInfo[]> {
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      expires: {
        gt: new Date(),
      },
    },
    orderBy: {
      expires: 'desc',
    },
  });

  return sessions.map(session => ({
    id: session.id,
    sessionToken: session.sessionToken,
    userId: session.userId,
    expires: session.expires,
    isCurrent: session.sessionToken === currentSessionToken,
  }));
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
    
    return result.count > 0;
  } catch (error) {
    console.error('Error revoking session:', error);
    return false;
  }
}

/**
 * Revoke all sessions except the current one
 */
export async function revokeAllOtherSessions(userId: string, currentSessionToken: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
        sessionToken: {
          not: currentSessionToken,
        },
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error revoking other sessions:', error);
    return 0;
  }
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllSessions(userId: string): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
    
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}

/**
 * Get session count for a user
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  return await prisma.session.count({
    where: {
      userId,
      expires: {
        gt: new Date(),
      },
    },
  });
}

/**
 * Check if a session exists and is valid
 */
export async function isValidSession(sessionToken: string): Promise<boolean> {
  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
      expires: {
        gt: new Date(),
      },
    },
  });
  
  return !!session;
}

/**
 * Update session last accessed time
 */
export async function updateSessionAccess(): Promise<void> {
  try {
    // Note: Since we're using NextAuth's Session model, we can't add custom fields
    // This would require extending the model or using a separate tracking table
    // For now, we'll rely on NextAuth's built-in session management
  } catch (error) {
    console.error('Error updating session access:', error);
  }
}
