"""Automatic database schema creation and idempotent demo seeding for serverless & fresh deployments."""
import os
import threading
from app.core.logging import logger
from app.database.base import Base
from app.database.connection import engine, is_sqlite

_bootstrap_lock = threading.Lock()
_bootstrapped = False


def ensure_database_ready() -> None:
    """Ensure all tables exist and initial seed data is present (idempotent)."""
    global _bootstrapped
    if _bootstrapped:
        return

    with _bootstrap_lock:
        if _bootstrapped:
            return
        try:
            # Register all SQLAlchemy models on Base.metadata
            import app.models  # noqa: F401

            # Create any missing tables (safe & idempotent on both SQLite and MySQL)
            Base.metadata.create_all(bind=engine)

            # Seed demo records automatically if database is empty (especially on Vercel /tmp SQLite)
            if is_sqlite or os.environ.get("VERCEL") or os.environ.get("AUTO_SEED_DB", "true").lower() == "true":
                from app.database.session import SessionLocal
                from app.models.course import Course

                db = SessionLocal()
                try:
                    has_courses = db.query(Course).count() > 0
                finally:
                    db.close()

                if not has_courses:
                    logger.info("Empty database detected — running idempotent seed_all()...")
                    from scripts.seed_database import seed_all
                    seed_all()
                    logger.info("Database auto-seeded successfully.")

            _bootstrapped = True
        except Exception as exc:
            logger.error(f"Database bootstrap warning: {exc}")
