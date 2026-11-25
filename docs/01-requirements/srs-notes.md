# Software Requirements Specification (SRS) — Enterprise LMS

**Document Version:** 1.0.0  
**Status:** Approved / Production Ready  
**Project Name:** Enterprise Learning Management System (LMS)  
**Technology Stack:** React 19 + Vite + Tailwind CSS 4 (Frontend) | Python FastAPI + SQLAlchemy 2.x + MySQL 8 (Backend)  

---

## 1. Introduction & Phase 1 System Analysis

### 1.1 Purpose
This Software Requirements Specification (SRS) provides a comprehensive architectural, functional, and non-functional blueprint for the Enterprise Learning Management System (LMS). It governs all 22 core operational modules across 3 primary authenticated roles (`Admin`, `Instructor`, `Student`) and unauthenticated public verification endpoints.

### 1.2 Scope
The Enterprise LMS is a full-stack academic and training platform designed for institutions, coaching academies, and corporate learning centers. It manages the entire lifecycle of structured education:
- Multi-role identity and access management with JWT access/refresh token rotation.
- Course catalog structuring with categories, hierarchical modules, lectures, and downloadable study materials.
- Cohort/batch scheduling with capacity limits, instructor assignments, and student enrollment tracking.
- Continuous assessment via rubric-based assignments, automated & manual grading, and timed server-enforced quizzes with anti-cheat event telemetry.
- Daily session attendance tracking with holiday and approved-leave exclusion formulas.
- Automated course completion calculation, verifiable digital certificate generation (QR/UUID code verification), and multi-installment fee & payment receipt management.

### 1.3 Phase 1 Problem Analysis & Objectives
Traditional academic management suffers from fragmented spreadsheets, manual attendance calculation errors, unverified certificate forgery, and lack of real-time fee reconciliation. Phase 1 analysis established five core engineering pillars:
1. **Single Source of Truth:** Unified MySQL 8 relational schema across 31 normalized tables with strict referential integrity.
2. **Deterministic Business Policies:** Mathematically auditable rules for attendance percentage, weighted course completion, and fee balance tracking.
3. **Security-First Architecture:** Stateless JWT access tokens paired with database-tracked, revocable refresh tokens, Argon2/bcrypt password hashing, and strict Role-Based + Resource-Ownership Access Control.
4. **High-Velocity Modern UX:** Responsive React 19 + Tailwind CSS 4 interface using an accessible `#4F46E5` (Indigo), `#06B6D4` (Cyan), and `#8B5CF6` (Violet) design system.
5. **Auditability:** Immutable audit trails (`audit_logs`) for sensitive state transitions (role changes, payment updates, grade overrides, certificate revocation).

---

## 2. User Roles & Persona Definitions

| Role Code | Role Name | Primary Responsibilities | Scope of Access |
| :--- | :--- | :--- | :--- |
| `ADMIN` | System Administrator | Platform configuration, user lifecycle, course/batch creation, fee collection, certificate issuance/revocation, system-wide analytics & audit logs. | Global (All resources across all courses and batches) |
| `INSTRUCTOR` | Faculty / Trainer | Curriculum authoring (modules, lectures, materials), assignment creation & grading, quiz authoring, batch attendance marking, student progress monitoring. | Scoped (Only courses and batches explicitly assigned to the instructor) |
| `STUDENT` | Learner / Enrollee | Consuming lectures/materials, submitting assignments, attempting timed quizzes, viewing attendance/grades/fee ledger, downloading earned certificates. | Personal (Only enrolled courses/batches and personal records) |
| `PUBLIC` | Anonymous Visitor | Searching public course catalog, authenticating, verifying certificate authenticity via Certificate Code/UUID. | Public Read-Only endpoints |

---

## 3. Comprehensive 22-Module Functional Requirements

### Module 01: Authentication & Session Management (`/api/v1/auth`)
- **FR-01.1:** Support email/password authentication returning a short-lived JWT Access Token (15–30 min) and a long-lived Refresh Token (7 days) stored in the `refresh_tokens` table.
- **FR-01.2:** Implement refresh token rotation and explicit revocation on logout or suspicious reuse detection.
- **FR-01.3:** Provide password reset request and token-verified password update flows (`password_reset_tokens`) with time-bound expiration.
- **FR-01.4:** Enforce account status checks (`is_active`, `status = 'ACTIVE'`) on every token issuance and protected API call.

### Module 02: User & Role Management (`/api/v1/users`)
- **FR-02.1:** Allow Admins to create, view, filter, update, activate, and deactivate users across `ADMIN`, `INSTRUCTOR`, and `STUDENT` roles.
- **FR-02.2:** Support profile self-service (`GET /users/me`, `PUT /users/me`, avatar upload, password change).
- **FR-02.3:** Prevent hard deletion of users with historical records; use soft deactivation (`is_active = False`).

### Module 03: Student Directory & Profiles (`/api/v1/students`)
- **FR-03.1:** Maintain student demographic, contact, guardian, enrollment, attendance, and financial summary views.
- **FR-03.2:** Provide consolidated student academic transcripts across all enrolled batches.

### Module 04: Instructor Profiles & Workload (`/api/v1/instructors`)
- **FR-04.1:** Extend user accounts with instructor metadata (`instructors` table: specialization, qualification, bio, experience years, rating).
- **FR-04.2:** Track assigned batches, active student counts, pending assignment submissions to grade, and lecture delivery metrics.

### Module 05: Course Categories (`/api/v1/categories`)
- **FR-05.1:** Organize courses into hierarchical or slug-indexed categories (`course_categories`) with icons, descriptions, and active toggles.
- **FR-05.2:** Restrict category deletion if active courses reference the category (`RESTRICT` / safe archive).

### Module 06: Course Catalog Management (`/api/v1/courses`)
- **FR-06.1:** Support full CRUD for courses including title, code, slug, level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`), duration weeks, base fee, thumbnail, syllabus summary, and publication status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- **FR-06.2:** Structure each course into ordered `course_modules` (`sort_order`) with learning objectives.

### Module 07: Batch & Cohort Scheduling (`/api/v1/batches`)
- **FR-07.1:** Create time-bound delivery cohorts (`batches`) linked to a course and a primary instructor (`instructor_id`).
- **FR-07.2:** Track `start_date`, `end_date`, `schedule_days`, `time_slot`, `max_capacity`, `current_strength`, and lifecycle status (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`).
- **FR-07.3:** Enforce batch capacity constraints so `current_strength` never exceeds `max_capacity`.

### Module 08: Student Enrollment Engine (`/api/v1/enrollments`)
- **FR-08.1:** Enroll students into courses and batches (`enrollments` and `batch_students`), initializing fee obligation and progress tracking (`completion_percentage = 0`).
- **FR-08.2:** Prevent duplicate active enrollment of the same student in the same batch (`UNIQUE(batch_id, student_id)`).
- **FR-08.3:** Support enrollment status transitions (`ACTIVE`, `COMPLETED`, `DROPPED`, `SUSPENDED`).

### Module 09: Lecture Delivery & Sequencing (`/api/v1/lectures`)
- **FR-09.1:** Manage ordered lectures within course modules supporting video URLs, embedded streams, live session links, duration minutes, and preview flags (`is_free_preview`).
- **FR-09.2:** Scope lecture visibility to enrolled students of the corresponding course/batch, assigned instructors, and admins.

### Module 10: Study Materials & Resource Repository (`/api/v1/materials`)
- **FR-10.1:** Attach downloadable files (PDF, PPTX, ZIP, DOCX) and external reference links (`study_materials`) to courses, modules, or individual lectures.
- **FR-10.2:** Validate file extensions, MIME headers, and maximum upload sizes (up to 50 MB for documents).

### Module 11: Lecture Progress Tracking (`/api/v1/progress`)
- **FR-11.1:** Record student consumption per lecture (`lecture_progress`: `is_completed`, `watch_time_seconds`, `last_position_seconds`, `completed_at`).
- **FR-11.2:** Automatically recalculate the student's overall course `completion_percentage` upon lecture completion events.

### Module 12: Assignment Authoring (`/api/v1/assignments`)
- **FR-12.1:** Allow instructors/admins to create course/batch assignments with `due_date`, `max_marks`, `passing_marks`, allowed file types, and late submission policies (`allow_late_submission`, `late_penalty_percent`).

### Module 13: Assignment Submissions & Grading (`/api/v1/submissions`)
- **FR-13.1:** Enable students to upload assignment files or text responses before the deadline (or late if permitted), tracking version/resubmission status.
- **FR-13.2:** Provide instructors with a grading workflow (`assignment_feedback`) recording `marks_obtained`, qualitative rubric feedback, graded timestamp, and grader ID.

### Module 14: Quiz & Question Bank Engine (`/api/v1/quizzes`)
- **FR-14.1:** Author timed assessments (`quizzes`) with `time_limit_minutes`, `total_marks`, `passing_percentage`, `max_attempts`, and question randomization options.
- **FR-14.2:** Support Multiple Choice (Single/Multi-Select), True/False, and Short Answer questions (`questions` and `quiz_options`).

### Module 15: Timed Quiz Attempts & Anti-Cheat Telemetry (`/api/v1/quizzes/{id}/attempts`)
- **FR-15.1:** Enforce server-side start and expiry timestamps (`started_at`, `expires_at`, `submitted_at`) in `quiz_attempts`.
- **FR-15.2:** Auto-grade objective questions upon submission and log client anti-cheat telemetry (`quiz_attempt_events`: tab switch, fullscreen exit, copy attempt) with configurable auto-termination thresholds.

### Module 16: Attendance Management (`/api/v1/attendance`)
- **FR-16.1:** Allow instructors and admins to record daily batch attendance (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `HOLIDAY`, `CANCELLED`).
- **FR-16.2:** Compute accurate student attendance percentages excluding `HOLIDAY`, `CANCELLED`, and approved `EXCUSED` sessions from the denominator (or per institutional policy).

### Module 17: Automated Certificate Issuance & Public Verification (`/api/v1/certificates`)
- **FR-17.1:** Verify eligibility criteria (Completion >= 80%, Attendance >= 75%, Passing quiz/assignment thresholds, Pending Fee == 0) before generating certificates.
- **FR-17.2:** Issue tamper-evident PDF certificates with unique `certificate_code` and `verification_uuid`, verifiable publicly at `/api/v1/certificates/verify/{code}`.

### Module 18: Fee Ledger & Payment Processing (`/api/v1/payments`)
- **FR-18.1:** Track total course fee, discount, net payable, paid amount, and pending balance (`Total Fee = Paid + Pending`).
- **FR-18.2:** Support full and installment payments via Cash, Card, UPI, Bank Transfer, or Online Gateway, generating immutable `payment_receipts` with unique receipt numbers.

### Module 19: In-App Notifications (`/api/v1/notifications`)
- **FR-19.1:** Dispatch targeted real-time/in-app notifications (`notifications`) for assignment deadlines, grade publication, payment receipts, attendance alerts, and certificate issuance.
- **FR-19.2:** Support unread count badges, single-item mark-as-read, and bulk mark-all-as-read.

### Module 20: Broadcast Announcements (`/api/v1/announcements`)
- **FR-20.1:** Enable admins and instructors to publish global, role-targeted, course-scoped, or batch-scoped announcements with priority levels (`LOW`, `NORMAL`, `HIGH`, `URGENT`) and expiry dates.

### Module 21: Analytics, Dashboards & Exports (`/api/v1/reports`)
- **FR-21.1:** Provide role-tailored KPI dashboards:
  - **Admin:** Total revenue, pending dues, enrollment trends, batch occupancy, active instructors, certificate issuance counts.
  - **Instructor:** Batch attendance averages, grading backlog, quiz score distributions, at-risk students.
  - **Student:** Course completion gauge, attendance percentage, upcoming deadlines, quiz score history.
- **FR-21.2:** Export tabular reports (Attendance Register, Fee Defaulters, Gradebook) in CSV/PDF formats.

### Module 22: System Settings, Health & Audit Logs (`/api/v1/settings`, `/api/v1/health`)
- **FR-22.1:** Store key-value institutional configuration (`system_settings`: attendance threshold, completion weights, tax rate, certificate signatory, SMTP toggles).
- **FR-22.2:** Record immutable `audit_logs` capturing `actor_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, and `created_at`.
- **FR-22.3:** Expose `/api/v1/health` probing database connectivity, uptime, and schema migration status.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Scalability
- **NFR-PERF-01:** 95th percentile API response latency (`p95`) MUST be `< 200ms` for standard CRUD queries under 500 concurrent users.
- **NFR-PERF-02:** All foreign keys, status filters, date ranges, and lookup slugs MUST be backed by composite or B-Tree MySQL 8 indexes.
- **NFR-PERF-03:** List endpoints MUST implement cursor or `page`/`page_size` pagination (default 20, max 100 items).

### 4.2 Security & Compliance
- **NFR-SEC-01:** Passwords MUST be hashed using Argon2id or bcrypt (work factor >= 12); plaintext passwords are never logged or stored.
- **NFR-SEC-02:** Every mutating request MUST pass JWT authentication, Role-Based Access Control (RBAC), and resource ownership validation.
- **NFR-SEC-03:** File uploads MUST sanitize filenames, reject executable payloads (`.exe`, `.sh`, `.php`, `.js`), verify magic bytes, and store files outside public web execution paths.

### 4.3 Reliability, Availability & Maintainability
- **NFR-REL-01:** Database transactions MUST be atomic (ACID) using SQLAlchemy 2.x unit-of-work commit/rollback blocks.
- **NFR-REL-02:** Critical historical records (`payments`, `certificates`, `audit_logs`, `submissions`) MUST be protected from cascade hard-deletion.
- **NFR-UI-01:** Frontend UI MUST conform to WCAG 2.1 AA contrast standards and support responsive breakpoints from `360px` mobile to `1920px+` desktop displays.
