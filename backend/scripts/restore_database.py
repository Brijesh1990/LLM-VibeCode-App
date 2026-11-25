"""Restore a NexusLMS MySQL backup (.sql) produced by scripts/backup_database.py.

Usage (from the backend/ folder):
    python -m scripts.restore_database                       # restores backups/lms_db_latest.sql
    python -m scripts.restore_database backups/<file>.sql
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings  # noqa: E402

BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"

MYSQL_CANDIDATES = [
    r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    r"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "/usr/bin/mysql",
    "/usr/local/bin/mysql",
]


def _find_mysql() -> str | None:
    for p in MYSQL_CANDIDATES:
        if os.path.exists(p):
            return p
    return shutil.which("mysql")


def restore(sql_file: Path) -> None:
    if not sql_file.exists():
        raise SystemExit(f"[ERROR] Backup file not found: {sql_file}")
    binary = _find_mysql()
    if not binary:
        raise SystemExit("[ERROR] mysql client not found. Install MySQL client tools or import via Workbench.")
    env = os.environ.copy()
    env["MYSQL_PWD"] = settings.DB_PASSWORD
    cmd = [
        binary,
        "-h", settings.DB_HOST,
        "-P", str(settings.DB_PORT),
        "-u", settings.DB_USER,
        "--default-character-set=utf8mb4",
    ]
    with open(sql_file, "r", encoding="utf-8") as f:
        result = subprocess.run(cmd, stdin=f, stderr=subprocess.PIPE, env=env, text=True)
    if result.returncode != 0:
        raise SystemExit(f"[ERROR] Restore failed: {result.stderr.strip()}")
    print(f"[OK] Restored {sql_file} into MySQL database `{settings.DB_NAME}`.")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else BACKUP_DIR / f"{settings.DB_NAME}_latest.sql"
    restore(target.resolve())
