"""
Utility script to block startup until PostgreSQL is ready to accept connections.
"""
import asyncio
import os
import sys
from typing import Optional

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL")
MAX_ATTEMPTS = int(os.getenv("DB_WAIT_ATTEMPTS", "20"))
SLEEP_SECONDS = float(os.getenv("DB_WAIT_INTERVAL", "3"))


async def wait_for_db(database_url: str) -> None:
    """Poll PostgreSQL until a connection succeeds or timeout is reached."""
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")

    last_error: Optional[Exception] = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            conn = await asyncpg.connect(database_url)
            await conn.close()
            print("✅ PostgreSQL is ready")
            return
        except Exception as exc:  # noqa: BLE001 - we want the last error for diagnostics
            last_error = exc
            print(
                f"⏳ Waiting for PostgreSQL (attempt {attempt}/{MAX_ATTEMPTS}): {exc}",
                flush=True,
            )
            await asyncio.sleep(SLEEP_SECONDS)

    raise RuntimeError(f"PostgreSQL did not become ready: {last_error}")


def main() -> None:
    try:
        asyncio.run(wait_for_db(DATABASE_URL))
    except Exception as exc:  # noqa: BLE001 - surface failure to caller
        print(f"❌ Database readiness check failed: {exc}", file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
