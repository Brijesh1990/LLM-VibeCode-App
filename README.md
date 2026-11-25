# Enterprise Learning Management System (LMS)

[![Frontend: React 19 + Vite + Tailwind CSS 4](https://img.shields.io/badge/Frontend-React_19_%2B_Vite_%2B_Tailwind_4-4F46E5)](./frontend)
[![Backend: FastAPI + SQLAlchemy 2.x](https://img.shields.io/badge/Backend-FastAPI_%2B_SQLAlchemy_2.x-06B6D4)](./backend)
[![Database: MySQL 8 (31 Tables)](https://img.shields.io/badge/Database-MySQL_8_(31_Tables)-8B5CF6)](./docs/02-design/data-dictionary.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981)](./LICENSE)

A production-grade, full-stack **Enterprise Learning Management System (LMS)** designed for academic institutions, training academies, and corporate learning centers. Built with **React 19 + Vite + Tailwind CSS 4** on the frontend and **Python FastAPI + SQLAlchemy 2.x + MySQL 8** on the backend.

---

## 1. Key Platform Highlights

- **31 Normalized MySQL 8 Tables:** Complete relational integrity across Identity, Curriculum, Cohorts, Assessments, Timed Quizzes, Attendance, Certificates, Payments, and Governance ([Data Dictionary](./docs/02-design/data-dictionary.md) | [Visual ERD](./docs/02-design/erd.png)).
- **22 REST API v1 Modules (`/api/v1/*`):** Full OpenAPI coverage with unified JSON envelopes and a ready-to-import [Postman v2.1 Collection](./docs/05-api/postman_collection.json).
- **3 Authenticated Portals + Public Credential Registry:**
  - **Administrator (`ADMIN`):** Executive KPI dashboard, user/role lifecycle, course & batch governance, student enrollment, installment fee collection, receipt generation, certificate issuance/revocation, system settings, and immutable audit logs.
  - **Instructor (`INSTRUCTOR`):** Scoped curriculum builder (modules, lectures, study materials), daily bulk attendance register, assignment grading studio, and timed quiz authoring with anti-cheat logs.
  - **Student (`STUDENT`):** Interactive lecture classroom with auto-progress sync, downloadable study materials, assignment submission portal, server-timed quiz arena, attendance breakdown, fee ledger & receipts, and downloadable certificates.
  - **Public Verification (`/verify/:code`):** Instant QR/code verification of issued or revoked digital certificates.
- **Deterministic Business Policy Engines ([Full Policies](./docs/03-business-rules/policies.md)):**
  - **Attendance Formula:** $\text{Attendance \%} = \frac{\text{Present Classes}}{\text{Total Eligible Classes}} \times 100$ (excludes `HOLIDAY`, `CANCELLED`, and approved `EXCUSED` leave from the denominator).
  - **Course Completion Formula:** $\text{Completion \%} = 50\% \text{ Lectures} + 30\% \text{ Assignments} + 20\% \text{ Quizzes}$ (with dynamic zero-component weight normalization).
  - **Financial Ledger Invariant:** $\text{Paid Amount} + \text{Pending Amount} = \text{Total Fee} - \text{Discount Amount}$ enforced atomically with immutable `payment_receipts`.
  - **Timed Quiz Anti-Cheat:** Server-enforced `started_at` / `expires_at` (+30s network grace window) and browser focus/tab-switch telemetry (`quiz_attempt_events`) with automatic termination on exceeding `max_warnings`.

---

## 2. Quick Start Guide (Windows & Linux)

### 2.1 Backend Setup (`FastAPI + SQLAlchemy 2.x`)
```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Seed the 31 tables with demo Admin, Instructor, Student, Courses, Batches & Records
python -m scripts.seed_db

# Start FastAPI server at http://localhost:8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2.2 Frontend Setup (`React 19 + Vite + Tailwind CSS 4`)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 3. Demo Role Credentials

| Role | Email | Password | Primary Workspace Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@lms.edu` | `Admin@123` | `/admin/dashboard` |
| **Instructor** | `instructor@lms.edu` | `Instructor@123` | `/instructor/dashboard` |
| **Student** | `student@lms.edu` | `Student@123` | `/student/dashboard` |
| **Public Verifier** | *(No login required)* | — | `/verify/CERT-2026-FSWD-0001` |

---

## 4. Complete Documentation Index (`docs/`)

| Directory | Files & Contents |
| :--- | :--- |
| **`docs/01-requirements/`** | [Software Requirements Specification (SRS)](./docs/01-requirements/srs-notes.md) • [Use Cases & 3-Role Permission Matrix](./docs/01-requirements/use-cases.md) |
| **`docs/02-design/`** | [31-Table Data Dictionary](./docs/02-design/data-dictionary.md) • [Visual ERD PNG](./docs/02-design/erd.png) • Wireframes: [Admin](./docs/02-design/wireframes/admin-wireframes.md), [Instructor](./docs/02-design/wireframes/instructor-wireframes.md), [Student](./docs/02-design/wireframes/student-wireframes.md), [Public](./docs/02-design/wireframes/public-wireframes.md) |
| **`docs/03-business-rules/`** | [Formulas & Operational Policies (Attendance, Completion, Fees, Quizzes, Certificates)](./docs/03-business-rules/policies.md) |
| **`docs/04-architecture/`** | [System Architecture & Request Lifecycle](./docs/04-architecture/architecture.md) • [Security, JWT Rotation & RBAC](./docs/04-architecture/security.md) |
| **`docs/05-api/`** | [22-Module REST API Endpoint Inventory](./docs/05-api/api-endpoints.md) • [Postman Collection v2.1 JSON](./docs/05-api/postman_collection.json) |
| **`docs/06-modules/`** | [Auth](./docs/06-modules/auth.md) • [Courses](./docs/06-modules/courses.md) • [Batches](./docs/06-modules/batches.md) • [Lectures](./docs/06-modules/lectures.md) • [Assignments](./docs/06-modules/assignments.md) • [Quizzes](./docs/06-modules/quizzes.md) • [Attendance](./docs/06-modules/attendance.md) • [Payments](./docs/06-modules/payments.md) • [Reports](./docs/06-modules/reports.md) |
| **`docs/07-prompts/`** | [Master Blueprint Prompt](./docs/07-prompts/master-prompt.md) • [Prompt Execution Log](./docs/07-prompts/prompt-log.md) • [Phase Module Prompts](./docs/07-prompts/module-prompts/phase-prompts.md) |
| **`docs/08-testing/`** | [QA Test Plan](./docs/08-testing/test-plan.md) • [Automated Test Execution Report](./docs/08-testing/test-report.md) • [Known Issues & Roadmap](./docs/08-testing/known-issues.md) |
| **`docs/09-deployment/`** | [Environment Variables Guide](./docs/09-deployment/env-guide.md) • [Deployment Guide (Windows, Linux, Cloud, Docker)](./docs/09-deployment/deployment-guide.md) • [Backup & Restore](./docs/09-deployment/backup-restore.md) |
| **`docs/10-user-manual/`** | [Admin Manual](./docs/10-user-manual/admin.md) • [Instructor Manual](./docs/10-user-manual/instructor.md) • [Student Manual](./docs/10-user-manual/student.md) |
| **`docs/11-reports/`** | [Engineering Progress Log](./docs/11-reports/progress-log.md) • [Platform Changelog](./docs/11-reports/changelog.md) • [Final Delivery Report](./docs/11-reports/final-report.md) |

---

## 5. License
Released under the [MIT License](./LICENSE).
