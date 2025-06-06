import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createApiKey, getUserApiKeys } from '@/lib/services/api-key-service';

// GET /api/user/api-keys - Get user's API keys
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const apiKeys = await getUserApiKeys(session.user.id);

    return NextResponse.json({
      apiKeys,
      total: apiKeys.length,
      limit: 5,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// POST /api/user/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, expiresAt } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'API key name must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Validate expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid expiration date' },
          { status: 400 }
        );
      }
      if (expirationDate <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    const apiKey = await createApiKey(session.user.id, {
      name: name.trim(),
      expiresAt: expirationDate,
    });

    return NextResponse.json(apiKey, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Maximum of 5 API keys allowed per user') {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}
