# Changelog — Enterprise Learning Management System (LMS)

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-25

### Added
- **Backend (Python FastAPI + SQLAlchemy 2.x + MySQL 8):**
  - Complete 31-table relational database schema (`roles`, `users`, `instructors`, `course_categories`, `courses`, `course_modules`, `batches`, `batch_students`, `enrollments`, `lectures`, `study_materials`, `lecture_progress`, `assignments`, `submissions`, `assignment_feedback`, `quizzes`, `questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `quiz_attempt_events`, `attendance`, `certificates`, `payments`, `payment_receipts`, `notifications`, `announcements`, `refresh_tokens`, `password_reset_tokens`, `audit_logs`, `system_settings`).
  - All 22 REST API v1 routers under `/api/v1/*` with Pydantic v2 validation and unified error/response envelopes.
  - JWT Access Token + Rotating Database-Backed Refresh Token authentication (`refresh_tokens`), password reset token flow (`password_reset_tokens`), and Argon2/bcrypt password hashing.
  - Role-Based Access Control (`ADMIN`, `INSTRUCTOR`, `STUDENT`) combined with resource-level ownership enforcement.
  - Business Rule Engines:
    - Attendance Formula: `(Present Classes / Total Eligible Classes) * 100` excluding `HOLIDAY`, `CANCELLED`, and `EXCUSED` leave.
    - Weighted Course Completion Formula: `50% Lectures + 30% Assignments + 20% Quizzes` with dynamic weight normalization.
    - Server-timed quiz attempt engine with 30s grace window and anti-cheat telemetry (`quiz_attempt_events`) auto-termination.
    - Batch seat capacity enforcement (`current_strength <= max_capacity`).
    - Financial fee ledger invariant enforcement (`Paid + Pending = Net Total Fee`) with automated `payment_receipts` generation.
    - 4-gate certificate eligibility verification and public credential verification endpoint (`/api/v1/certificates/verify/{code}`).
- **Frontend (React 19 + Vite + Tailwind CSS 4):**
  - Multi-role responsive portals for **Admin**, **Instructor**, **Student**, and **Public Certificate Verification**.
  - Styled with brand color tokens `#4F46E5` (Indigo), `#06B6D4` (Cyan), `#8B5CF6` (Violet), and `#F8FAFC` (Slate 50).
- **Documentation & QA (`docs/`):**
  - Full 11-directory documentation suite including SRS, Use Cases, Role Wireframes, 31-Table Data Dictionary, visual ERD (`docs/02-design/erd.png`), Business Policies, Architecture & Security specs, API Inventory, Postman v2.1 Collection, Module Specs, Prompts, Test Reports, Deployment Guides, and User Manuals.
