/**
 * User management helpers for API routes
 *
 * Handles creating and fetching users in the PostgreSQL database
 */

import { Session } from 'next-auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

/**
 * Get or create a user in the database based on session
 * Returns the user UUID
 */
export async function getOrCreateUser(session: Session): Promise<string> {
  if (!session.user?.email) {
    throw new Error('No email in session');
  }

  try {
    // Try to fetch user from backend
    const response = await fetch(`${BACKEND_URL}/api/users/by-email/${encodeURIComponent(session.user.email)}`);

    if (response.ok) {
      const user = await response.json();
      return user.id;
    }

    // User doesn't exist, create it
    if (response.status === 404) {
      const createResponse = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name || null,
          image: session.user.image || null,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await createResponse.json();
      return newUser.id;
    }

    throw new Error('Failed to fetch user');
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}
