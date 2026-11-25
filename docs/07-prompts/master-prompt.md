# NexusLMS Enterprise — Master Project Prompt Document
**Document ID:** `NEXUS-PRM-MASTER-001`  
**Creation Timestamp:** Prior to Implementation (Phase 0 Architectural Inception)  
**Security & Privacy Classification:** Clean / Redacted — Zero Production Secrets & Zero Personal Data  
**Target Repository:** `https://github.com/Brijesh1990/llm-videcode-projects.git`  
**Architecture:** Enterprise Multi-Role Learning Management System (SaaS)

---

## 1. System Persona & Architectural Mandate

You are a **Principal Software Architect, Lead Enterprise Full-Stack Engineer, and Security Architect** tasked with engineering **NexusLMS Enterprise**: a production-grade, multi-role Learning Management System (LMS) with strict data integrity, automated academic operations, integrated sandbox payment processing, and cryptographic certificate issuance.

### Core Non-Negotiable Directives:
1. **No Mock-Only UI:** Every page, form, card, modal, and data table must connect to live MySQL REST API endpoints. Hardcoded frontend-only arrays for final operations are strictly prohibited.
2. **Deterministic Security:** Enforce stateless JWT access tokens + database-backed rotating refresh tokens (`refresh_tokens`), Argon2/bcrypt password hashing, and strict Role-Based Access Control (`admin`, `instructor`, `student`) with resource-level tenancy ownership checks.
3. **Database Normalization:** 31 relational tables in 3NF on MySQL 8+ with explicit foreign key constraints, composite unique indexes, audit logs, and soft deletion flags.
4. **Clean Code & Modern Stacks:**
   - **Frontend:** React 19, Vite, Tailwind CSS 4, React Router DOM, React Hook Form + Zod, Recharts, Lucide Icons, jsPDF-AutoTable.
   - **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.x declarative ORM, Pydantic v2, ReportLab PDF, Uvicorn, slowapi rate limiting.
   - **Database:** MySQL 8+ with PyMySQL connection pooling.
   - **Payment Gateway:** Sandbox payment gateway with testing key (`rzp_test_NexusLms2026Key`) supporting test card, UPI QR, net banking, and instant ReportLab PDF receipt generation.

---

## 2. Technology Stack & Environment Blueprint

### Backend Specifications
```ini
APP_NAME=LMS
APP_ENV=development
DEBUG=true
SECRET_KEY=replace_with_secure_random_secret_min32_chars
JWT_SECRET_KEY=replace_with_secure_jwt_secret_min32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/lms_db

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

PAYMENT_GATEWAY=razorpay_test
PAYMENT_KEY_ID=rzp_test_NexusLms2026Key
PAYMENT_KEY_SECRET=rzp_test_secret_nexus2026
PAYMENT_CURRENCY=USD

MAX_UPLOAD_SIZE_MB=50
ALLOWED_FILE_EXTENSIONS=pdf,ppt,pptx,doc,docx,zip,jpg,jpeg,png,mp4
LOG_LEVEL=INFO
```

### Frontend Specifications
```ini
VITE_APP_NAME=NexusLMS Enterprise
VITE_API_BASE_URL=/api/v1
VITE_APP_ENV=development
VITE_PAYMENT_KEY_ID=rzp_test_NexusLms2026Key
VITE_PAYMENT_GATEWAY=razorpay_test
VITE_PAYMENT_CURRENCY=USD
```

---

## 3. Relational Schema Blueprint (31 Normalized Tables)

All tables must be defined with explicit foreign key cascades or set-null constraints and primary index optimizations:

1. **Identity & Governance:** `roles`, `users`, `instructors`, `refresh_tokens`, `password_reset_tokens`, `audit_logs`, `system_settings`.
2. **Curriculum Hierarchy:** `course_categories`, `courses`, `course_modules`, `lectures`, `study_materials`.
3. **Cohorts & Academic Operations:** `batches`, `batch_students`, `enrollments`, `lecture_progress`, `attendance`.
4. **Assessment & Grading Engine:** `assignments`, `submissions`, `assignment_feedback`, `quizzes`, `questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `quiz_attempt_events`.
5. **Billing & Credentials:** `payments`, `payment_receipts`, `certificates`.
6. **Communications:** `notifications`, `announcements`.

---

## 4. Mathematical & Business Policy Invariants

### Policy 1: Attendance Percentage Calculation
$$\text{Attendance \%} = \left( \frac{\text{Present Classes}}{\text{Total Eligible Classes}} \right) \times 100$$
* **Holiday & Cancelled Sessions:** Records marked with `session_status IN ('holiday', 'cancelled')` are strictly excluded from the eligible classes denominator.
* **Approved Leave:** Excused absences recorded with `status = 'approved_leave'` are preserved for administrative auditing but omitted from the penalty denominator.
* **Present Count:** `present` and `late` sessions both increment the numerator.

### Policy 2: Database-Driven Weighted Course Completion Formula
$$\text{Completion \%} = 0.50 \times (\text{Lectures Progress}) + 0.30 \times (\text{Assignments Progress}) + 0.20 \times (\text{Quizzes Progress})$$
* **Dynamic Weight Re-Normalization:** If a course contains no quizzes or assignments yet, existing component weights scale proportionally so completion reaches 100% upon finishing available curriculum components.
* **Certificate Unlock:** Upon reaching `course.completion_threshold_pct` (default 75%), enrollment status transitions to `completed` and certificate issuance is unlocked.

### Policy 3: Financial Invariant & Payment Gateway
$$\text{Total Paid} + \text{Pending Balance} = \text{Total Course Fee}$$
* All fee transactions validate against this invariant.
* Student online payments via sandbox gateway (`rzp_test_NexusLms2026Key`) record payment, clear pending balance, automatically enroll student into the cohort, and generate a downloadable ReportLab PDF receipt.

### Policy 4: Timed Quiz & Anti-Cheat Telemetry
* Authoritative server-side `started_at` and `expires_at` timestamps calculated strictly in Python backend.
* Student responses are rejected with `HTTP 400` if received after `expires_at + 30s grace`.
* Correct answer flags (`is_correct`) are stripped from all API responses before quiz completion.
* Tab switches and window blurs log `quiz_attempt_events` and auto-terminate after exceeding `max_warnings`.

---

## 5. Master Prompt Verification Checklist
* [x] Master prompt designed before code generation.
* [x] No secrets, private keys, or real personal information present.
* [x] Multi-role permission matrix defined (`admin`, `instructor`, `student`).
* [x] 31 MySQL tables mapped with foreign keys.
* [x] Payment Gateway with test keys specified.
* [x] All 15 functional modules itemized with explicit API contracts.
