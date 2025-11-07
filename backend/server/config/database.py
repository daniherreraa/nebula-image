"""
Database configuration and connection pool for PostgreSQL
"""
import os
import asyncpg
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    """PostgreSQL database connection manager"""

    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://nebula_user:nebula_password_dev@postgres:5432/nebula_db"
        )

    async def connect(self):
        """Create database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("✅ Database connection pool created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create database pool: {e}")
            raise

    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    async def execute(self, query: str, *args):
        """Execute a query that doesn't return rows"""
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)

    async def fetch(self, query: str, *args):
        """Execute a query and return all rows"""
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        """Execute a query and return a single row"""
        async with self.pool.acquire() as connection:
            return await connection.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        """Execute a query and return a single value"""
        async with self.pool.acquire() as connection:
            return await connection.fetchval(query, *args)


# Global database instance
db = Database()


async def get_db() -> Database:
    """Dependency for FastAPI routes"""
    return db
