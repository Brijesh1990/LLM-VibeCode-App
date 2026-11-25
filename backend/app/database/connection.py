from sqlalchemy import create_engine
from app.core.config import settings

db_url = settings.DATABASE_URL
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
