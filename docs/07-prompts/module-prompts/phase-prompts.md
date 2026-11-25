# Phase-by-Phase Module Prompts (`phase-prompts.md`)

**Document Version:** 1.0.0  
**Project:** Enterprise LMS  

---

## Phase 1: Database & ORM Foundation Prompt
> "Generate all 31 SQLAlchemy 2.x declarative models for MySQL 8 covering Identity (`roles`, `users`, `instructors`, `refresh_tokens`, `password_reset_tokens`), Curriculum (`course_categories`, `courses`, `course_modules`, `lectures`, `study_materials`), Cohorts (`batches`, `batch_students`, `enrollments`, `lecture_progress`, `attendance`), Assessments (`assignments`, `submissions`, `assignment_feedback`, `quizzes`, `questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `quiz_attempt_events`), Finance/Credentials (`certificates`, `payments`, `payment_receipts`), and Governance (`notifications`, `announcements`, `audit_logs`, `system_settings`). Enforce composite unique constraints and explicit `ON DELETE` rules."

---

## Phase 2: Authentication & RBAC Security Prompt
> "Implement `/api/v1/auth` with `login`, `refresh`, `logout`, `forgot-password`, `reset-password`, and `me`. Store SHA-256 hashes of refresh tokens in `refresh_tokens` with `jti` rotation and replay detection. Build FastAPI dependencies `get_current_user` and `require_roles(*roles)` that reject inactive users (`is_active == False`) and unauthorized roles with structured JSON error envelopes."

---

## Phase 3: Academic Operations & Progress Engine Prompt
> "Implement `/api/v1/courses`, `/api/v1/batches`, `/api/v1/enrollments`, `/api/v1/lectures`, `/api/v1/materials`, and `/api/v1/progress`. Enforce batch seat capacity (`current_strength < max_capacity`) during enrollment. Recalculate `enrollments.completion_percentage` using the `50% Lectures + 30% Assignments + 20% Quizzes` formula whenever a student completes a lecture, receives a passing assignment grade, or passes a quiz."

---

## Phase 4: Assessments, Attendance, Payments & Certificates Prompt
> "Implement `/api/v1/assignments`, `/api/v1/submissions`, `/api/v1/quizzes`, `/api/v1/attendance`, `/api/v1/payments`, and `/api/v1/certificates`. Enforce server-side `expires_at` on quiz attempts and log `quiz_attempt_events` with auto-termination on `warning_count > max_warnings`. Exclude `HOLIDAY`, `CANCELLED`, and `EXCUSED` sessions from the attendance denominator. Enforce `Paid + Pending = Net Total Fee` on installment payments and verify all 4 eligibility gates before issuing certificates."

---

## Phase 5: React 19 + Tailwind CSS 4 Multi-Role Portal Prompt
> "Build the React 19 + Vite + Tailwind CSS 4 frontend using brand tokens `#4F46E5`, `#06B6D4`, `#8B5CF6`, and `#F8FAFC`. Provide dedicated role workspaces for Admin (KPI dashboard, users, courses, batches, enrollments, fee collection, certificates, audit logs), Instructor (curriculum builder, bulk attendance register, grading studio, quiz builder), Student (classroom player, assignment uploader, timed quiz arena with anti-cheat listeners, fee & certificate viewer), and Public (course catalog and `/verify/:code` certificate verifier)."
