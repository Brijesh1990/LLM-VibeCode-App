# System Architecture & Technical Design — Enterprise LMS

**Document Version:** 1.0.0  
**Frontend Stack:** React 19 + Vite 6 + Tailwind CSS 4 + React Router 7 + Lucide Icons  
**Backend Stack:** Python 3.12 + FastAPI + SQLAlchemy 2.x + Pydantic v2 + PyMySQL / MySQL 8  

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Tier (Browser / SPA)"]
        UI["React 19 + Vite + Tailwind CSS 4"]
        Router["Role-Guarded Router (Admin / Instructor / Student / Public)"]
        APIClient["Axios / Fetch Interceptor (JWT Access + Silent Refresh)"]
        UI --> Router --> APIClient
    end

    subgraph API["Application Tier (FastAPI Backend /api/v1)"]
        MW["CORS + Rate Limiter + Request ID + Security Headers Middleware"]
        Deps["Auth & RBAC Dependencies (get_current_user, require_roles)"]
        Routers["22 REST API Routers (/auth, /users, /courses, /batches, ...)"]
        Services["Domain Service Layer (Attendance, Progress, QuizTimer, FeeEngine)"]
        Models["SQLAlchemy 2.x ORM Models (31 Mapped Tables)"]
        MW --> Routers
        Deps --> Routers
        Routers --> Services --> Models
    end

    subgraph Data["Data & Storage Tier"]
        MySQL[("MySQL 8.0 Relational DB\n(31 Normalized Tables)")]
        FS[("Local / S3 Media Storage\n(Materials, Submissions, PDFs)")]
    end

    APIClient <-->|"HTTPS JSON / Multipart"| MW
    Models <-->|"Connection Pool (SQLAlchemy)"| MySQL
    Services <-->|"Validated File I/O"| FS
```

---

## 2. Repository Directory Structure

```text
d:\LLM-VibeCoding\
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                 # JWT decoding, RBAC & resource ownership guards
│   │   │   └── v1/
│   │   │       ├── api.py              # Central v1 APIRouter aggregator
│   │   │       └── endpoints/          # 22 modular route handlers
│   │   │           ├── auth.py
│   │   │           ├── users.py
│   │   │           ├── students.py
│   │   │           ├── instructors.py
│   │   │           ├── categories.py
│   │   │           ├── courses.py
│   │   │           ├── batches.py
│   │   │           ├── enrollments.py
│   │   │           ├── lectures.py
│   │   │           ├── materials.py
│   │   │           ├── progress.py
│   │   │           ├── assignments.py
│   │   │           ├── submissions.py
│   │   │           ├── quizzes.py
│   │   │           ├── attendance.py
│   │   │           ├── certificates.py
│   │   │           ├── payments.py
│   │   │           ├── notifications.py
│   │   │           ├── announcements.py
│   │   │           ├── reports.py
│   │   │           ├── settings.py
│   │   │           └── health.py
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic BaseSettings (.env loader)
│   │   │   ├── database.py             # SQLAlchemy 2.x engine & SessionLocal
│   │   │   ├── security.py             # Argon2/bcrypt & JWT token utilities
│   │   │   └── exceptions.py           # Unified JSON error handlers
│   │   ├── models/                     # 31 SQLAlchemy 2.x ORM models
│   │   ├── schemas/                    # Pydantic v2 request/response DTOs
│   │   ├── services/                   # Business rule engines (attendance, fees, certs)
│   │   ├── utils/                      # File storage, PDF generator, pagination
│   │   └── main.py                     # FastAPI application entrypoint
│   ├── scripts/
│   │   └── seed_db.py                  # Idempotent demo data seeder
│   ├── tests/                          # Pytest unit & integration suites
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                        # Typed API client & token refresh interceptor
│   │   ├── components/                 # Reusable UI widgets, modals, tables, charts
│   │   ├── context/                    # AuthContext & Toast/Notification provider
│   │   ├── layouts/                    # Role-specific AppShells (Admin, Instructor, Student)
│   │   ├── pages/
│   │   │   ├── admin/                  # Admin management consoles
│   │   │   ├── instructor/             # Curriculum, attendance, grading studios
│   │   │   ├── student/                # Classroom player, quiz arena, certificates
│   │   │   └── public/                 # Login, catalog, public certificate verifier
│   │   ├── types/                      # TypeScript domain interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── docs/                               # Complete engineering & user documentation
```

---

## 3. Request Lifecycle & Service Layer Pattern

```mermaid
sequenceDiagram
    autonumber
    participant Client as React 19 SPA
    participant Router as FastAPI Endpoint
    participant Guard as Auth/RBAC Dependency
    participant Service as Domain Service
    participant DB as MySQL 8 (SQLAlchemy)

    Client->>Router: POST /api/v1/payments (Bearer JWT)
    Router->>Guard: Validate JWT signature, expiry & require_roles(["ADMIN"])
    Guard->>DB: Verify user is_active == True
    Guard-->>Router: Inject current_user (Admin)
    Router->>Service: payment_service.record_payment(db, payload, actor=current_user)
    Service->>DB: SELECT enrollment FOR UPDATE
    Service->>Service: Validate amount <= pending_amount & recompute balances
    Service->>DB: INSERT payment, INSERT payment_receipt, UPDATE enrollment
    Service->>DB: INSERT notification (Student) & INSERT audit_log (Admin)
    Service->>DB: COMMIT transaction
    Service-->>Router: PaymentReceiptResponse DTO
    Router-->>Client: HTTP 201 Created (Unified JSON Envelope)
```

### Why the Service Layer Pattern?
1. **Thin Controllers:** FastAPI route functions handle only HTTP parsing, status codes, and dependency injection.
2. **Transactional Integrity:** Multi-table mutations (e.g., recording a payment + updating enrollment balance + generating a receipt + writing an audit log) execute inside a single atomic DB session commit.
3. **Reusable Business Rules:** Course completion and attendance formulas live in dedicated services invoked consistently by lecture progress, grading, quiz submission, and certificate eligibility checks.

---

## 4. Storage Strategy (Media, Submissions & Generated PDFs)

- **Local Development & Single-Node Deployment:** Files are stored in a structured, non-executable directory outside the source code tree:
  - `uploads/materials/{course_id}/{uuid}_{filename}`
  - `uploads/submissions/{assignment_id}/{student_id}/{uuid}_{filename}`
  - `uploads/certificates/{certificate_code}.pdf`
  - `uploads/receipts/{receipt_number}.pdf`
- **Cloud Production Deployment:** Abstracted behind a storage service interface (`StorageProvider`) allowing zero-code-change switching between local disk volumes and S3-compatible object storage (AWS S3, Cloudflare R2, MinIO) via `STORAGE_BACKEND=local|s3`.
