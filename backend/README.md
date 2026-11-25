# LMS Backend – FastAPI + SQLAlchemy 2.x + MySQL 8+

Enterprise Learning Management System REST API built with Python FastAPI, SQLAlchemy 2.x ORM, Alembic migrations, JWT authentication, ReportLab PDF generation, and Pandas/OpenPyXL reporting.

## Quick Start

1. Configure environment:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run database migrations & seed synthetic data:
   ```bash
   alembic upgrade head
   python -m scripts.seed_database
   ```
4. Start development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. Run test suite:
   ```bash
   pytest -v
   ```
