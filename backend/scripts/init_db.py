"""One-shot database bootstrap for NexusLMS.

Run from the backend/ folder:
    python -m scripts.init_db

Steps (all idempotent, safe to re-run):
1. Connect to the MySQL server and CREATE DATABASE IF NOT EXISTS <DB_NAME> (utf8mb4).
2. Apply Alembic migrations (`alembic upgrade head`).
3. Seed synthetic demo records (skipped automatically if data already exists).
"""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

import pymysql  # noqa: E402

from app.core.config import settings  # noqa: E402


def ensure_database() -> None:
    try:
        conn = pymysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            charset="utf8mb4",
        )
    except pymysql.err.OperationalError as exc:
        raise SystemExit(
            f"[ERROR] Cannot connect to MySQL at {settings.DB_HOST}:{settings.DB_PORT} as "
            f"'{settings.DB_USER}'. Is the MySQL80 service running and are DB_USER/DB_PASSWORD "
            f"in backend/.env correct?\n        Details: {exc}"
        )
    with conn.cursor() as cur:
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` "
            "DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
    conn.commit()
    conn.close()
    print(f"[OK] MySQL database `{settings.DB_NAME}` is ready.")


def run_migrations() -> None:
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    command.upgrade(cfg, "head")
    print("[OK] Alembic migrations applied (head).")


def seed() -> None:
    from scripts.seed_database import seed_all

    seed_all()
    print("[OK] Seed step complete.")


if __name__ == "__main__":
    ensure_database()
    run_migrations()
    seed()
    print("[DONE] Database bootstrap finished.")
