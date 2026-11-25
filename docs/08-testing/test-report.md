# Automated & Integration Test Execution Report (`test-report.md`)

**Document Version:** 1.1.0  
**Execution Date:** November 25, 2026  
**Environment:** Windows (`win32`) / Python 3.14.7 (`pytest-9.2.0`) / FastAPI + SQLAlchemy 2.x + MySQL 8 (`lms_test_db`) / React 19 + Vite 6  

---

## 1. Executive Summary

| Suite | Total Tests | Passed | Failed | Skipped | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`tests/test_auth.py` (Auth, JWT, Password Reset, Health)** | 7 | 7 | 0 | 0 | **100%** |
| **`tests/test_users.py` (Users, Students, Instructors, Settings, RBAC)** | 4 | 4 | 0 | 0 | **100%** |
| **`tests/test_courses.py` (Categories, Courses, Modules, Safe Archive)** | 3 | 3 | 0 | 0 | **100%** |
| **`tests/test_batches.py` (Batches, Enrollments, Date & Capacity Validation)** | 2 | 2 | 0 | 0 | **100%** |
| **`tests/test_assignments.py` (Lectures, Materials Upload/Download, Assignments & Evaluation)** | 3 | 3 | 0 | 0 | **100%** |
| **`tests/test_quizzes.py` (Quiz Creation, Answer Hiding, Server Scoring, Duplicate Prevention)** | 1 | 1 | 0 | 0 | **100%** |
| **`tests/test_attendance.py` (Attendance Marking, Audit Log, Formula, Progress)** | 2 | 2 | 0 | 0 | **100%** |
| **`tests/test_payments.py` (Payments, PDF Receipts, Certificates, Notifications, Reports Exports)** | 4 | 4 | 0 | 0 | **100%** |
| **TOTAL AUTOMATED PYTEST SUITE** | **26** | **26** | **0** | **0** | **100%** |

---

## 2. Actual Pytest Execution Output (`pytest -v`)

```text
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.2.0, pluggy-1.7.0 -- C:\Users\Admin\AppData\Local\Programs\Python\Python314\python.exe
cachedir: .pytest_cache
rootdir: D:\LLM-VibeCoding\backend
plugins: anyio-4.14.2
collecting ... collected 26 items

tests/test_assignments.py::test_lectures_and_completion_tracking PASSED  [  3%]
tests/test_assignments.py::test_study_materials_multipart_upload_and_download PASSED [  7%]
tests/test_assignments.py::test_assignments_submissions_and_evaluation_max_marks_validation PASSED [ 11%]
tests/test_attendance.py::test_attendance_marking_duplicate_prevention_audit_and_percentage_formula PASSED [ 15%]
tests/test_attendance.py::test_student_progress_endpoint PASSED          [ 19%]
tests/test_auth.py::test_health_check_endpoint PASSED                    [ 23%]
tests/test_auth.py::test_login_valid_roles PASSED                        [ 26%]
tests/test_auth.py::test_login_invalid_credentials_returns_401 PASSED    [ 30%]
tests/test_auth.py::test_login_inactive_user_returns_403 PASSED          [ 34%]
tests/test_auth.py::test_register_and_me_endpoint PASSED                 [ 38%]
tests/test_auth.py::test_refresh_token_rotation_and_replay_rejection PASSED [ 42%]
tests/test_auth.py::test_change_password_and_forgot_reset_password_flow PASSED [ 46%]
tests/test_batches.py::test_batch_date_validation_rejects_end_before_start PASSED [ 50%]
tests/test_batches.py::test_batch_capacity_enforcement_and_enrollments PASSED [ 53%]
tests/test_courses.py::test_categories_crud_and_active_course_protection PASSED [ 57%]
tests/test_courses.py::test_courses_and_modules_crud_and_search PASSED   [ 61%]
tests/test_courses.py::test_course_safe_archive_when_active_enrollments_exist PASSED [ 65%]
tests/test_payments.py::test_payments_partial_and_full_calculation_and_pdf_receipt PASSED [ 69%]
tests/test_payments.py::test_certificate_generation_pdf_download_and_public_verification PASSED [ 73%]
tests/test_payments.py::test_notifications_and_announcements PASSED      [ 76%]
tests/test_payments.py::test_reports_dashboard_and_analytics_csv_excel_pdf_exports PASSED [ 80%]
tests/test_quizzes.py::test_quiz_creation_answer_hiding_server_scoring_and_duplicate_prevention PASSED [ 84%]
tests/test_users.py::test_rbac_enforcement_blocks_non_admins PASSED      [ 88%]
tests/test_users.py::test_admin_users_crud PASSED                        [ 92%]
tests/test_users.py::test_students_crud PASSED                           [ 96%]
tests/test_users.py::test_instructors_crud_and_system_settings PASSED    [100%]

======================= 26 passed, 2 warnings in 20.78s =======================
```

---

## 3. Detailed Test Case Verification Log

| Test ID | Test File & Function | Description | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `TC-AUTH-01` | `test_auth.py::test_health_check_endpoint` | Health check `/api/v1/health` with MySQL connection probe | HTTP `200`, `status: "healthy"`, `database: "connected"` | HTTP `200`, healthy & connected | **PASS** |
| `TC-AUTH-02` | `test_auth.py::test_login_valid_roles` | Admin, Instructor, Student login with valid credentials | HTTP `200`, returns JWT `access_token`, `refresh_token`, and role profile | Matches expected | **PASS** |
| `TC-AUTH-03` | `test_auth.py::test_login_invalid_credentials_returns_401` | Invalid password on `/api/v1/auth/login` | HTTP `401 Unauthorized` | HTTP `401 Unauthorized` | **PASS** |
| `TC-AUTH-04` | `test_auth.py::test_login_inactive_user_returns_403` | Deactivated user (`is_active=False`) rejected on login and `/me` | HTTP `403 Forbidden` | HTTP `403 Forbidden` | **PASS** |
| `TC-AUTH-05` | `test_auth.py::test_register_and_me_endpoint` | Student registration `/api/v1/auth/register`, duplicate 409, `/api/v1/auth/me` | HTTP `201` on register, `409` on duplicate, `200` on `/me` | Matches expected | **PASS** |
| `TC-AUTH-06` | `test_auth.py::test_refresh_token_rotation_and_replay_rejection` | Refresh token rotation and revocation of previous refresh token | HTTP `200` on first use; HTTP `401` on replay of rotated refresh token | Matches expected | **PASS** |
| `TC-AUTH-07` | `test_auth.py::test_change_password_and_forgot_reset_password_flow` | `/change-password`, `/forgot-password`, and `/reset-password` lifecycle | Wrong old password -> `400`; valid change & reset token -> `200` | Matches expected | **PASS** |
| `TC-USR-01` | `test_users.py::test_rbac_enforcement_blocks_non_admins` | Student/Instructor attempting admin-only `/users`, `/students`, `/instructors`, `/settings` | HTTP `403 Forbidden` across all protected endpoints | HTTP `403 Forbidden` | **PASS** |
| `TC-USR-02` | `test_users.py::test_admin_users_crud` | Admin CRUD on `/api/v1/users` (list, create, detail, update, soft-delete) | HTTP `200/201` across full lifecycle | Matches expected | **PASS** |
| `TC-USR-03` | `test_users.py::test_students_crud` | Admin CRUD on `/api/v1/students` with student code & attendance summary | HTTP `200/201` with `STU-` code and attendance stats | Matches expected | **PASS** |
| `TC-USR-04` | `test_users.py::test_instructors_crud_and_system_settings` | Admin CRUD on `/api/v1/instructors` and `/api/v1/settings` | HTTP `200/201`, persists `InstructorProfile` and `SystemSetting` | Matches expected | **PASS** |
| `TC-CRS-01` | `test_courses.py::test_categories_crud_and_active_course_protection` | Category CRUD, duplicate slug `409`, and active course deletion guard `409` | HTTP `201` on create, `409` when deleting category with active courses | Matches expected | **PASS** |
| `TC-CRS-02` | `test_courses.py::test_courses_and_modules_crud_and_search` | Course & Module CRUD plus search/filter on `/api/v1/courses` and `/api/v1/modules` | HTTP `200/201`, filters accurately by keyword, category, and status | Matches expected | **PASS** |
| `TC-CRS-03` | `test_courses.py::test_course_safe_archive_when_active_enrollments_exist` | Deleting a course with active student enrollments | Safely archives course (`status: "archived"`) instead of hard-deleting | Matches expected | **PASS** |
| `TC-BAT-01` | `test_batches.py::test_batch_date_validation_rejects_end_before_start` | Creating batch with `end_date < start_date` | HTTP `400 Bad Request` | HTTP `400 Bad Request` | **PASS** |
| `TC-BAT-02` | `test_batches.py::test_batch_capacity_enforcement_and_enrollments` | Enrolling students up to batch capacity and rejecting overflow | HTTP `201` within capacity; HTTP `409 Conflict` when capacity is reached | Matches expected | **PASS** |
| `TC-ASN-01` | `test_assignments.py::test_lectures_and_completion_tracking` | Lecture CRUD and `/api/v1/lectures/{id}/complete` progress update | HTTP `200`, marks lecture completed and recalculates course progress | Matches expected | **PASS** |
| `TC-ASN-02` | `test_assignments.py::test_study_materials_multipart_upload_and_download` | Multipart upload to `/api/v1/materials` and protected download | HTTP `201` on upload; HTTP `200` binary stream on `/download` | Matches expected | **PASS** |
| `TC-ASN-03` | `test_assignments.py::test_assignments_submissions_and_evaluation_max_marks_validation` | Assignment creation, student submission upload, instructor evaluation & max marks check | `marks_obtained > max_marks` -> `400`; valid evaluation -> `200` (`evaluated`) | Matches expected | **PASS** |
| `TC-QUZ-01` | `test_quizzes.py::test_quiz_creation_answer_hiding_server_scoring_and_duplicate_prevention` | Quiz creation, hiding `is_correct` from students, `/start`, server-side scoring on `/submit`, duplicate `409` | `is_correct` omitted for students; server grades 15/30 (`50.0%`); duplicate -> `409` | Matches expected | **PASS** |
| `TC-ATT-01` | `test_attendance.py::test_attendance_marking_duplicate_prevention_audit_and_percentage_formula` | `/api/v1/attendance/mark` upsert, `UPDATE_ATTENDANCE` audit log, `(Present / Eligible) * 100` formula | Excludes `holiday`, `cancelled`, `approved_leave`; 3 present / 4 eligible = `75.0%` | Matches expected | **PASS** |
| `TC-ATT-02` | `test_attendance.py::test_student_progress_endpoint` | `/api/v1/progress` weighted completion (`50% L + 30% A + 20% Q`) and attendance % | Returns `completion_percentage: 100.0`, `attendance_percentage: 75.0` | Matches expected | **PASS** |
| `TC-PAY-01` | `test_payments.py::test_payments_partial_and_full_calculation_and_pdf_receipt` | Partial & full payment calculation (`Pending = Total - Paid`) and PDF receipt download | `1200 - 450 = 750` (`partially_paid`), `1200 - 1200 = 0` (`paid`), PDF `%PDF` valid | Matches expected | **PASS** |
| `TC-PAY-02` | `test_payments.py::test_certificate_generation_pdf_download_and_public_verification` | `/api/v1/certificates/generate`, PDF download, and public `/verify/{code}` | HTTP `201` certificate generated, PDF downloaded, public verification `is_valid: true` | Matches expected | **PASS** |
| `TC-PAY-03` | `test_payments.py::test_notifications_and_announcements` | `/api/v1/notifications` (`read`, `read-all`) and `/api/v1/announcements` CRUD | HTTP `200/201` across all notification and announcement endpoints | Matches expected | **PASS** |
| `TC-PAY-04` | `test_payments.py::test_reports_dashboard_and_analytics_csv_excel_pdf_exports` | `/api/v1/reports/dashboard` (all 3 roles) and `/api/v1/reports/analytics` (`csv`, `xlsx`, `pdf`) | Valid KPIs for Admin/Instructor/Student; valid CSV, OOXML `.xlsx`, and `%PDF` exports | Matches expected | **PASS** |
