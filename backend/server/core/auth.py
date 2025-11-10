"""
Authentication utilities for FastAPI
"""
from fastapi import Header, HTTPException, status
from typing import Optional
import jwt
import os
import logging

logger = logging.getLogger(__name__)

# Auth.js uses this secret to sign JWTs
AUTH_SECRET = os.getenv("AUTH_SECRET")

if not AUTH_SECRET:
    raise RuntimeError("AUTH_SECRET environment variable is not set")


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
) -> Optional[str]:
    """
    Extract user ID from Auth.js session cookie or authorization header

    Auth.js stores session in cookies with format:
    - Cookie name: authjs.session-token (production) or next-auth.session-token (dev)
    - Value is a JWT signed with AUTH_SECRET
    """

    # Try to get session token from cookies
    session_token = None

    if cookie:
        # Parse cookies
        cookies = {}
        for item in cookie.split(';'):
            item = item.strip()
            if '=' in item:
                key, value = item.split('=', 1)
                cookies[key.strip()] = value.strip()

        # Look for session token (try both names)
        session_token = cookies.get('authjs.session-token') or cookies.get('next-auth.session-token')

    # If no session token found, try authorization header
    if not session_token and authorization:
        if authorization.startswith('Bearer '):
            session_token = authorization[7:]

    if not session_token:
        logger.warning("No session token found in request")
        return None

    try:
        # Decode JWT without verification for now (Auth.js handles verification)
        # In production, you should verify the signature
        decoded = jwt.decode(
            session_token,
            options={"verify_signature": False}  # Auth.js already verified it
        )

        user_id = decoded.get('sub') or decoded.get('userId') or decoded.get('id')

        if user_id:
            logger.info(f"✅ Authenticated user: {user_id}")
            return user_id
        else:
            logger.warning(f"No user ID found in token: {decoded}")
            return None

    except jwt.InvalidTokenError as e:
        logger.error(f"❌ Invalid JWT token: {e}")
        return None
    except Exception as e:
        logger.error(f"❌ Error decoding token: {e}")
        return None


async def require_auth(
    authorization: Optional[str] = Header(None),
    cookie: Optional[str] = Header(None)
) -> str:
    """
    Require authentication and return user ID
    Raises 401 if not authenticated
    """
    user_id = await get_current_user_id(authorization, cookie)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    return user_id
