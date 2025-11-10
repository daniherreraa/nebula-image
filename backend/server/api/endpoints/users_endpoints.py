"""
API endpoints for User management
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from pydantic import BaseModel, EmailStr
import logging
from uuid import UUID, uuid4

from config.database import Database, get_db

logger = logging.getLogger(__name__)

router = APIRouter()


class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    image: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: str
    updated_at: str


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Database = Depends(get_db)
):
    """
    Create a new user in the database

    If user with email already exists, returns the existing user
    """
    try:
        # Check if user already exists
        check_query = """
            SELECT id, email, name, image, created_at, updated_at
            FROM users
            WHERE email = $1
        """
        existing_user = await db.fetchrow(check_query, user_data.email)

        if existing_user:
            logger.info(f"✅ User {user_data.email} already exists")
            return UserResponse(
                id=str(existing_user['id']),
                email=existing_user['email'],
                name=existing_user['name'],
                image=existing_user['image'],
                created_at=existing_user['created_at'].isoformat(),
                updated_at=existing_user['updated_at'].isoformat()
            )

        # Create new user
        insert_query = """
            INSERT INTO users (id, email, name, image)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, name, image, created_at, updated_at
        """

        new_id = str(uuid4())
        result = await db.fetchrow(
            insert_query,
            new_id,
            user_data.email,
            user_data.name,
            user_data.image
        )

        logger.info(f"✅ Created new user: {user_data.email} (ID: {new_id})")

        return UserResponse(
            id=str(result['id']),
            email=result['email'],
            name=result['name'],
            image=result['image'],
            created_at=result['created_at'].isoformat(),
            updated_at=result['updated_at'].isoformat()
        )

    except Exception as e:
        logger.error(f"❌ Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.get("/users/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    db: Database = Depends(get_db)
):
    """
    Get a user by email address
    """
    try:
        query = """
            SELECT id, email, name, image, created_at, updated_at
            FROM users
            WHERE email = $1
        """

        user = await db.fetchrow(query, email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with email {email} not found"
            )

        return UserResponse(
            id=str(user['id']),
            email=user['email'],
            name=user['name'],
            image=user['image'],
            created_at=user['created_at'].isoformat(),
            updated_at=user['updated_at'].isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: Database = Depends(get_db)
):
    """
    Get a user by ID
    """
    try:
        query = """
            SELECT id, email, name, image, created_at, updated_at
            FROM users
            WHERE id = $1
        """

        user = await db.fetchrow(query, str(user_id))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )

        return UserResponse(
            id=str(user['id']),
            email=user['email'],
            name=user['name'],
            image=user['image'],
            created_at=user['created_at'].isoformat(),
            updated_at=user['updated_at'].isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )
