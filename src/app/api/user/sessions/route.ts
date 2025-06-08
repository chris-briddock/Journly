import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getUserSessions, 
  revokeSession, 
  revokeAllOtherSessions,
  getUserSessionCount 
} from '@/lib/services/session-service';
import { z } from 'zod';

// Force Node.js runtime for session management
export const runtime = 'nodejs';

// Validation schemas
const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

const revokeAllOthersSchema = z.object({
  confirm: z.boolean().refine(val => val === true, 'Confirmation required'),
});

// GET /api/user/sessions - Get all active sessions for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get current session token from cookies
    const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                        request.cookies.get('__Secure-next-auth.session-token')?.value;

    // Get all active sessions
    const sessions = await getUserSessions(userId, sessionToken);
    
    // Get session count
    const sessionCount = await getUserSessionCount(userId);

    return NextResponse.json({
      sessions,
      sessionCount,
      currentSessionToken: sessionToken,
    });

  } catch (error) {
    console.error('[Sessions] Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/sessions - Revoke a specific session or all other sessions
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Get current session token
    const currentSessionToken = request.cookies.get('next-auth.session-token')?.value ||
                               request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!currentSessionToken) {
      return NextResponse.json(
        { error: 'Current session not found' },
        { status: 400 }
      );
    }

    // Check if this is a request to revoke all other sessions
    if (body.revokeAllOthers) {
      const validation = revokeAllOthersSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validation.error.errors },
          { status: 400 }
        );
      }

      const revokedCount = await revokeAllOtherSessions(userId, currentSessionToken);
      
      return NextResponse.json({
        success: true,
        message: `Successfully revoked ${revokedCount} session(s)`,
        revokedCount,
      });
    }

    // Revoke a specific session
    const validation = revokeSessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { sessionId } = validation.data;
    
    // Prevent revoking the current session through this endpoint
    const sessions = await getUserSessions(userId, currentSessionToken);
    const targetSession = sessions.find(s => s.id === sessionId);
    
    if (!targetSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (targetSession.isCurrent) {
      return NextResponse.json(
        { error: 'Cannot revoke current session. Use logout instead.' },
        { status: 400 }
      );
    }

    const success = await revokeSession(sessionId, userId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to revoke session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });

  } catch (error) {
    console.error('[Sessions] Error revoking session:', error);
    return NextResponse.json(
      { error: 'Failed to revoke session' },
      { status: 500 }
    );
  }
}
