/**
 * API Route Proxy for Models
 *
 * This route acts as a proxy between the Next.js frontend and the FastAPI backend.
 * It handles authentication by passing the user's session token to the backend.
 */

import { NextRequest, NextResponse } from 'next/server';
import { safeAuth } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { getOrCreateUser } from '../lib/user-helper';
import { getServerApiUrl } from '@/lib/config';

const BACKEND_URL = getServerApiUrl();

export async function GET(request: NextRequest) {
  try {
    // Validate AUTH_SECRET at runtime
    const AUTH_SECRET = process.env.AUTH_SECRET;
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { detail: 'Server configuration error: AUTH_SECRET not set' },
        { status: 500 }
      );
    }

    // Get the authenticated session
    const session = await safeAuth();

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get or create user in database and get UUID
    const userId = await getOrCreateUser(session);

    // Extract query parameters (limit, offset)
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

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

    // Make request to backend with the token as a cookie
    const backendUrl = `${BACKEND_URL}/api/models?limit=${limit}&offset=${offset}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch models' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in models proxy:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate AUTH_SECRET at runtime
    const AUTH_SECRET = process.env.AUTH_SECRET;
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { detail: 'Server configuration error: AUTH_SECRET not set' },
        { status: 500 }
      );
    }

    // Get the authenticated session
    const session = await safeAuth();

    if (!session?.user) {
      return NextResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get or create user in database and get UUID
    const userId = await getOrCreateUser(session);

    // Get request body
    const body = await request.json();

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

    // Make request to backend with the token as a cookie
    const backendUrl = `${BACKEND_URL}/api/models`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to save model' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error in models proxy:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
