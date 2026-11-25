# Documentation & Platform Changelog (`docs/11-reports/changelog.md`)

All notable architectural, backend, frontend, and documentation changes for the **Enterprise LMS** are recorded in this document.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-11-25 (Production Release)

### Added
- **31-Table Normalized MySQL 8 Relational Schema:** Implemented `roles`, `users`, `instructors`, `course_categories`, `courses`, `course_modules`, `batches`, `batch_students`, `enrollments`, `lectures`, `study_materials`, `lecture_progress`, `assignments`, `submissions`, `assignment_feedback`, `quizzes`, `questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `quiz_attempt_events`, `attendance`, `certificates`, `payments`, `payment_receipts`, `notifications`, `announcements`, `refresh_tokens`, `password_reset_tokens`, `audit_logs`, and `system_settings`.
- **22 FastAPI REST v1 Modules (`/api/v1/*`):** Full CRUD, domain workflows, pagination, filtering, and unified JSON response envelopes across all 22 operational endpoints.
- **Hybrid JWT Security & RBAC Ownership Engine:** Short-lived JWT Access Tokens paired with database-persisted rotating Refresh Tokens (`refresh_tokens`), replay detection, bcrypt/Argon2 password hashing, and resource-scoped ownership guards.
- **Deterministic Business Policy Engines:**
  - Attendance percentage formula excluding `HOLIDAY`, `CANCELLED`, and `EXCUSED` leave from the denominator.
  - Weighted course completion engine (`50% Lectures + 30% Assignments + 20% Quizzes`) with dynamic zero-component re-normalization.
  - 4-gate certificate eligibility verifier and public QR/code verification endpoint (`/api/v1/certificates/verify/{code}`).
  - Authoritative server-side quiz timer with 30-second grace window and browser focus/tab-switch anti-cheat auto-termination.
  - Atomic batch capacity enforcement (`current_strength <= max_capacity`) and financial invariant enforcement (`Paid + Pending = Net Total Fee`).
- **React 19 + Vite + Tailwind CSS 4 Multi-Role Frontend:** Dedicated workspaces for `ADMIN`, `INSTRUCTOR`, `STUDENT`, and `PUBLIC` visitors styled with the `#4F46E5`, `#06B6D4`, `#8B5CF6`, `#F8FAFC` design system.
- **Complete 11-Section Engineering Documentation Suite (`docs/`):** SRS, Use Cases, Role Wireframes, 31-Table Data Dictionary, visual ERD (`erd.png`), Business Policies, Architecture, Security, API Inventory, Postman Collection v2.1, Module Specs, Prompts, Testing Reports, Deployment Guides, and User Manuals.
