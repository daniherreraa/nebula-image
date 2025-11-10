/**
 * API Route Proxy for Individual Model Operations
 *
 * Handles GET and DELETE operations for individual models
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { getOrCreateUser } from '../../lib/user-helper';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not defined. Set it in your environment.');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    // Get the authenticated session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get or create user in database and get UUID
    const userId = await getOrCreateUser(session);

    // Create a JWT token with the user UUID for the backend
    const token = jwt.sign(
      {
        sub: userId,
        userId: userId,
        email: session.user.email,
        name: session.user.name,
      },
      AUTH_SECRET,
      { expiresIn: '1h' }
    );

    // Make request to backend
    const backendUrl = `${BACKEND_URL}/api/models/${params.modelId}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch model' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in model GET proxy:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    // Get the authenticated session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get or create user in database and get UUID
    const userId = await getOrCreateUser(session);

    // Create a JWT token with the user UUID for the backend
    const token = jwt.sign(
      {
        sub: userId,
        userId: userId,
        email: session.user.email,
        name: session.user.name,
      },
      AUTH_SECRET,
      { expiresIn: '1h' }
    );

    // Make request to backend
    const backendUrl = `${BACKEND_URL}/api/models/${params.modelId}`;

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete model' }));
      return NextResponse.json(error, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Error in model DELETE proxy:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
