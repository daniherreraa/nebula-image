/**
 * Centralized API configuration
 *
 * This file provides consistent API URL configuration for both client and server environments.
 * It handles the fact that NEXT_PUBLIC_* variables are replaced at build time.
 */

/**
 * Get the backend API URL for client-side requests (browser)
 *
 * Priority:
 * 1. NEXT_PUBLIC_API_URL (if set during build)
 * 2. Azure production URL (if in production)
 * 3. Localhost (for local development)
 */
export function getClientApiUrl(): string {
  // NEXT_PUBLIC_API_URL is replaced at build time
  const buildTimeUrl = process.env.NEXT_PUBLIC_API_URL;

  if (buildTimeUrl) {
    return buildTimeUrl;
  }

  // Fallback for production (Azure)
  if (process.env.NODE_ENV === 'production') {
    return 'https://nebulabackend.azurewebsites.net';
  }

  // Local development
  return 'http://localhost:8000';
}

/**
 * Get the backend API URL for server-side requests (API routes, SSR)
 *
 * Priority:
 * 1. BACKEND_URL (server-side env var)
 * 2. NEXT_PUBLIC_API_URL (if set during build)
 * 3. Azure production URL (if in production)
 * 4. Docker service name (for docker-compose)
 * 5. Localhost (for local development)
 */
export function getServerApiUrl(): string {
  // Server-side environment variable (not replaced at build time)
  const serverUrl = process.env.BACKEND_URL;

  if (serverUrl) {
    return serverUrl;
  }

  // NEXT_PUBLIC_API_URL is replaced at build time
  const buildTimeUrl = process.env.NEXT_PUBLIC_API_URL;

  if (buildTimeUrl) {
    return buildTimeUrl;
  }

  // Fallback for production (Azure)
  if (process.env.NODE_ENV === 'production') {
    return 'https://nebulabackend.azurewebsites.net';
  }

  // Docker Compose environment
  if (process.env.DOCKER === 'true') {
    return 'http://backend:8000';
  }

  // Local development
  return 'http://localhost:8000';
}

/**
 * Get the appropriate API URL based on execution context
 * Use this in components that might run on both client and server
 */
export function getApiUrl(): string {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    return getClientApiUrl();
  }

  // Server-side (SSR, API routes)
  return getServerApiUrl();
}
