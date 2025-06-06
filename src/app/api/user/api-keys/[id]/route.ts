import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { revokeApiKey, deleteApiKey } from '@/lib/services/api-key-service';

// DELETE /api/user/api-keys/[id] - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await deleteApiKey(session.user.id, id);

    return NextResponse.json(
      { message: 'API key deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    
    if (error instanceof Error && error.message === 'API key not found') {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/api-keys/[id] - Revoke an API key
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'revoke') {
      await revokeApiKey(session.user.id, id);
      return NextResponse.json(
        { message: 'API key revoked successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "revoke" to deactivate the key.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating API key:', error);
    
    if (error instanceof Error && error.message === 'API key not found') {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update API key' },
      { status: 500 }
    );
  }
}
