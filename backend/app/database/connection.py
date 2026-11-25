import os
from sqlalchemy import create_engine
from app.core.config import settings

db_url = settings.DATABASE_URL

# On Vercel serverless, localhost/127.0.0.1 MySQL is unreachable — fall back cleanly to /tmp SQLite
if os.environ.get("VERCEL") and (
    "localhost" in db_url.lower() or "127.0.0.1" in db_url.lower()
):
    db_url = "sqlite:////tmp/lms_db.db"

is_sqlite = "sqlite" in db_url.lower()

if is_sqlite:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20,
        echo=False,
    )
