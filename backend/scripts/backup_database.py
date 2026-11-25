"""MySQL 8+ database backup utility for NexusLMS.

Usage (from the backend/ folder):
    python -m scripts.backup_database            # timestamped dump + backups/lms_db_latest.sql
    python -m scripts.backup_database --python   # force pure-Python dump (no mysqldump needed)

Strategy:
1. Prefer the official `mysqldump` binary (consistent snapshot via --single-transaction).
   The password is passed through the MYSQL_PWD environment variable, never on the
   command line, so it does not leak into process listings.
2. If mysqldump is unavailable, fall back to a pure-Python dump using SQLAlchemy/PyMySQL
   that writes DROP/CREATE TABLE statements plus batched INSERTs for every table.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_engine, text  # noqa: E402

from app.core.config import settings  # noqa: E402

BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"
LATEST_NAME = f"{settings.DB_NAME}_latest.sql"

MYSQLDUMP_CANDIDATES = [
    r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    r"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
    r"C:\Program Files\MySQL\MySQL Server 9.0\bin\mysqldump.exe",
    "/usr/bin/mysqldump",
    "/usr/local/bin/mysqldump",
]


def _find_mysqldump() -> str | None:
    for p in MYSQLDUMP_CANDIDATES:
        if os.path.exists(p):
            return p
    return shutil.which("mysqldump")


def _dump_with_mysqldump(binary: str, out_file: Path) -> None:
    env = os.environ.copy()
    env["MYSQL_PWD"] = settings.DB_PASSWORD
    cmd = [
        binary,
        "-h", settings.DB_HOST,
        "-P", str(settings.DB_PORT),
        "-u", settings.DB_USER,
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        "--set-gtid-purged=OFF",
        "--default-character-set=utf8mb4",
        "--add-drop-database",
        "--databases", settings.DB_NAME,
    ]
    with open(out_file, "w", encoding="utf-8") as f:
        result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, env=env, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "mysqldump failed")


def _sql_literal(value) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, (int, float, Decimal)):
        return str(value)
    if isinstance(value, (datetime, date, time)):
        return f"'{value.isoformat(sep=' ') if isinstance(value, datetime) else value.isoformat()}'"
    if isinstance(value, timedelta):
        return f"'{value}'"
    if isinstance(value, (bytes, bytearray)):
        return "0x" + value.hex() if value else "''"
    s = str(value)
    s = (
        s.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\x00", "\\0")
        .replace("\x1a", "\\Z")
    )
    return f"'{s}'"


def _dump_with_python(out_file: Path) -> None:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    db = settings.DB_NAME
    with engine.connect() as conn, open(out_file, "w", encoding="utf-8") as f:
        f.write(f"-- NexusLMS MySQL backup (pure-Python fallback)\n")
        f.write(f"-- Database: `{db}`  Generated: {datetime.now().isoformat()}\n\n")
        f.write("/*!40101 SET NAMES utf8mb4 */;\nSET FOREIGN_KEY_CHECKS=0;\n")
        f.write(f"CREATE DATABASE IF NOT EXISTS `{db}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n")
        f.write(f"USE `{db}`;\n\n")
        tables = [r[0] for r in conn.execute(text("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'"))]
        for table in tables:
            ddl = conn.execute(text(f"SHOW CREATE TABLE `{table}`")).fetchone()[1]
            f.write(f"-- ----------------------------\n-- Table `{table}`\n-- ----------------------------\n")
            f.write(f"DROP TABLE IF EXISTS `{table}`;\n{ddl};\n\n")
            result = conn.execute(text(f"SELECT * FROM `{table}`"))
            cols = ", ".join(f"`{c}`" for c in result.keys())
            batch: list[str] = []
            for row in result:
                batch.append("(" + ", ".join(_sql_literal(v) for v in row) + ")")
                if len(batch) >= 200:
                    f.write(f"INSERT INTO `{table}` ({cols}) VALUES\n" + ",\n".join(batch) + ";\n")
                    batch = []
            if batch:
                f.write(f"INSERT INTO `{table}` ({cols}) VALUES\n" + ",\n".join(batch) + ";\n")
            f.write("\n")
        f.write("SET FOREIGN_KEY_CHECKS=1;\n")
    engine.dispose()


def backup_database(force_python: bool = False) -> str:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = BACKUP_DIR / f"{settings.DB_NAME}_backup_{ts}.sql"

    binary = None if force_python else _find_mysqldump()
    method = "mysqldump"
    try:
        if binary:
            _dump_with_mysqldump(binary, out_file)
        else:
            raise FileNotFoundError("mysqldump not found")
    except Exception as exc:  # fall back to pure-Python
        if binary:
            print(f"[WARN] mysqldump failed ({exc}); using pure-Python fallback.")
        method = "python"
        _dump_with_python(out_file)

    latest = BACKUP_DIR / LATEST_NAME
    shutil.copyfile(out_file, latest)
    size_kb = out_file.stat().st_size / 1024
    print(f"[OK] Backup via {method}: {out_file} ({size_kb:.1f} KB)")
    print(f"[OK] Latest copy:        {latest}")
    return str(out_file)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Back up the NexusLMS MySQL database.")
    parser.add_argument("--python", action="store_true", help="Force the pure-Python dump method.")
    args = parser.parse_args()
    backup_database(force_python=args.python)
