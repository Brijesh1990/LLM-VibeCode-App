# MASTER VIBE CODING PROMPT
# LMS – LEARNING MANAGEMENT SYSTEM
## Enterprise-Level Full Stack SaaS Application

**PROJECT TYPE:** Production-Ready Full Stack Web Application  
**PROJECT NAME:** LMS – Learning Management System  
**ARCHITECTURE:** Frontend + Backend + REST API + Database  
**DEVELOPMENT APPROACH:** AI-Assisted Vibe Coding with Human Review

---

# 1. YOUR ROLE

Act as a Principal Software Architect, Senior Full Stack Developer, UI/UX Designer, Database Architect, DevOps Engineer, QA Engineer and Security Engineer.

Your responsibility is to design and develop a complete, production-ready Learning Management System (LMS).

Do not create just a demo, prototype, static dashboard or UI-only application.

Build a complete working application with:

- Professional frontend GUI.
- Fully functional backend.
- Real MySQL database.
- SQLAlchemy ORM.
- JWT authentication.
- Role-based authorization.
- Complete CRUD operations.
- REST API integration.
- File upload and download.
- Reports and analytics.
- PDF certificate generation.
- Payment and fee management.
- Testing and deployment configuration.
- Complete project documentation.

Every frontend feature must communicate with the actual FastAPI backend.

Never use hardcoded arrays as the final data source.

Never create buttons, forms, navigation links or dashboard cards that do nothing.

# 2. MANDATORY TECHNOLOGY STACK

## Frontend

- React.js 19
- Vite
- JavaScript ES6+
- Tailwind CSS 4
- React Router DOM
- Axios
- React Context API
- React Hook Form
- Zod
- Recharts
- Lucide React
- AOS (Animate On Scroll)
- React Hot Toast or Sonner
- SweetAlert2
- React Icons
- date-fns
- React Dropzone
- jsPDF
- jsPDF-AutoTable
- TanStack Table
- Framer Motion for selected UI interactions
- AOS for scroll animations

Use Tailwind CSS 4 with the official Vite integration:

- @tailwindcss/vite
- @import "tailwindcss";

Do not use Tailwind CSS 3 configuration or outdated installation instructions.

## Backend

- Python 3.12+
- FastAPI
- Uvicorn
- SQLAlchemy 2.x
- MySQL 8+
- PyMySQL or mysqlclient
- Pydantic 2
- pydantic-settings
- Alembic
- python-jose or PyJWT
- passlib or pwdlib with Argon2/bcrypt
- python-multipart
- email-validator
- pytest
- httpx
- reportlab
- pandas
- openpyxl
- slowapi or another suitable rate-limiting solution

## Database

MySQL 8+

Use:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Relationships
- Transactions
- Appropriate delete strategies
- created_at
- updated_at
- Soft deletion where necessary

# 3. PROJECT PURPOSE

Develop a centralized Learning Management System for a training institute.

The system must manage:

1. Students
2. Instructors
3. Administrators
4. Courses
5. Course modules
6. Batches
7. Enrollments
8. Lectures
9. Study materials
10. Assignments
11. Submissions
12. Evaluations
13. Quizzes
14. Questions
15. Quiz attempts
16. Attendance
17. Student progress
18. Certificates
19. Payments
20. Notifications
21. Announcements
22. Reports and analytics

The system must have three primary roles:

- Admin
- Instructor
- Student

# 4. COMPLETE USER ROLE MANAGEMENT

## A. ADMIN

Admin has complete institute-level management permissions.

Admin Dashboard must display:

- Total students
- Total instructors
- Total courses
- Total batches
- Active batches
- Total enrollments
- Total revenue
- Pending fees
- Pending assignment evaluations
- Recent registrations
- Enrollment analytics
- Revenue analytics
- Course-wise performance
- Batch-wise statistics

Admin modules:

1. Manage Students
2. Manage Instructors
3. Manage Users
4. Manage Courses
5. Manage Course Categories
6. Manage Course Modules
7. Manage Batches
8. Manage Enrollments
9. Manage Lectures
10. Manage Study Materials
11. Manage Assignments
12. Manage Submissions
13. Manage Quizzes
14. Manage Attendance
15. Manage Payments
16. Manage Certificates
17. Manage Notifications
18. Manage Announcements
19. Manage Reports
20. Manage Profile
21. System Settings

Admin operations:

- Add
- View
- Edit
- Delete or deactivate
- Search
- Filter
- Sort
- Pagination
- Export
- View details

## B. INSTRUCTOR

Instructor Dashboard must display:

- Assigned courses
- Assigned batches
- Total students
- Upcoming lectures
- Pending assignment evaluations
- Recent submissions
- Attendance overview
- Student performance
- Quiz statistics

Instructor modules:

1. My Dashboard
2. My Courses
3. My Batches
4. Student Roster
5. Manage Lectures
6. Upload Study Materials
7. Create Assignments
8. Review Submissions
9. Evaluate Assignments
10. Create Quizzes
11. Manage Quiz Questions
12. Record Attendance
13. Student Progress
14. Announcements
15. Notifications
16. Profile Settings

Instructors must only manage their assigned courses and batches.

## C. STUDENT

Student Dashboard must display:

- Enrolled courses
- Active batches
- Completed lectures
- Pending assignments
- Upcoming quizzes
- Attendance percentage
- Course completion percentage
- Recent notifications
- Recent results

Student modules:

1. My Dashboard
2. My Courses
3. Course Details
4. My Lectures
5. Study Materials
6. My Assignments
7. Submit Assignments
8. My Submissions
9. Assignment Feedback
10. Available Quizzes
11. Quiz Examination
12. Quiz Results
13. My Attendance
14. My Progress
15. My Certificates
16. My Payments
17. Payment Receipts
18. Notifications
19. Profile Settings

Students must only access their own records and enrolled course content.

# 5. AUTHENTICATION AND AUTHORIZATION

Implement complete authentication.

Frontend screens:

- Login
- Registration (where permitted by institute policy)
- Forgot Password
- Reset Password
- Change Password
- User Profile

Backend endpoints:

POST /api/auth/login
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me
PUT /api/auth/change-password

Requirements:

- JWT access tokens.
- Secure refresh-token strategy.
- Token expiration from environment variables.
- Password hashing using Argon2 or bcrypt.
- Email validation.
- Unique email validation.
- Inactive user rejection.
- Role-based access control.
- Resource-level access control.
- Protected frontend routes.
- Protected backend APIs.
- Secure logout and token revocation strategy.
- Password reset tokens with expiry.

Never store plain-text passwords.

Never rely on frontend route protection alone.

Enforce authorization on every protected backend endpoint.

# 6. COMPLETE DATABASE DESIGN

Create the database ERD before implementing the backend.

Implement the following suggested tables:

1. users
2. roles
3. courses
4. course_categories
5. course_modules
6. batches
7. batch_students
8. instructors
9. lectures
10. study_materials
11. enrollments
12. assignments
13. submissions
14. assignment_feedback
15. quizzes
16. questions
17. quiz_options
18. quiz_attempts
19. quiz_answers
20. attendance
21. lecture_progress
22. certificates
23. payments
24. notifications
25. announcements

Additional tables may be introduced when justified, such as:

- refresh_tokens
- password_reset_tokens
- payment_receipts
- audit_logs
- quiz_attempt_events

Database requirements:

- SQLAlchemy 2.x declarative models.
- Proper one-to-many relationships.
- Proper many-to-many relationships.
- Foreign key constraints.
- Unique constraints.
- Database indexes.
- Enum or validated status fields.
- Timestamps.
- Transaction handling.
- Alembic migrations.
- Appropriate cascade/restrict/soft-delete rules.

Create:

- ERD diagram.
- Database schema.
- Data dictionary.
- Initial migration.
- Seed data script.

Seed only synthetic demonstration records.

# 7. COURSE MANAGEMENT

Implement complete course management.

Course fields:

- Course ID
- Course name
- Category
- Description
- Duration
- Course fee
- Thumbnail
- Status
- Assigned instructor
- Created date

Features:

- Create course.
- Edit course.
- Delete or archive course.
- Publish/unpublish course.
- Search courses.
- Filter by category.
- Filter by status.
- View course details.
- Assign instructor.
- Create course modules.
- Organize lectures.

Prevent unsafe deletion of courses with active dependent records.

# 8. BATCH MANAGEMENT

Batch fields:

- Batch ID
- Batch name
- Course
- Instructor
- Start date
- End date
- Class days
- Class timing
- Capacity
- Status

Features:

- Create batch.
- Update batch.
- Close batch.
- Archive batch.
- Add students.
- Remove students.
- View batch roster.
- Search and filter batches.
- Prevent enrollment beyond capacity.
- Validate batch dates.

# 9. LECTURE AND STUDY MATERIAL MANAGEMENT

Instructor capabilities:

- Create lectures.
- Edit lectures.
- Delete lectures.
- Reorder lectures.
- Add video URLs.
- Upload supported video files.
- Upload PDF files.
- Upload PPT files.
- Upload approved study materials.

Student capabilities:

- View authorized lectures.
- Watch video links.
- Download materials.
- Mark lectures complete.
- View completed lecture history.

Technical rules:

- Store metadata and storage URLs in MySQL.
- Do not store large video binaries inside MySQL.
- Validate file extensions and actual file content.
- Enforce upload size limits.
- Use persistent object storage in production.
- Protect private downloads with authorization.

# 10. ASSIGNMENT MANAGEMENT

Instructor:

- Create assignments.
- Set instructions.
- Attach reference files.
- Set maximum marks.
- Set deadlines.
- Assign to a course or batch.
- View student submissions.
- Evaluate submissions.
- Provide feedback.

Student:

- View assignments.
- Download reference material.
- Upload files.
- Submit answers.
- View submission history.
- View marks.
- View feedback.

Statuses:

- Pending
- Submitted
- Under Review
- Evaluated
- Late Submission

Validate deadlines, file types, file sizes and maximum marks on the backend.

# 11. QUIZ AND EXAMINATION MANAGEMENT

Instructor features:

- Create quizzes.
- Add MCQ questions.
- Add multiple options.
- Define correct answers.
- Set total marks.
- Set passing marks.
- Set examination duration.
- Set availability window.
- Configure retake permissions.
- View student attempts.
- View results.

Student features:

- View available quizzes.
- Start examination.
- Display timer.
- Navigate questions.
- Select answers.
- Save answers.
- Submit examination.
- View results.

Critical security:

- Calculate scores on the backend.
- Never trust browser-submitted marks.
- Never expose correct answers before submission.
- Enforce quiz timing using server timestamps.
- Prevent unauthorized duplicate attempts.
- Handle timeout and interrupted attempts.

# 12. ATTENDANCE MANAGEMENT

Instructor:

- Select batch.
- Select class date.
- View student roster.
- Mark Present.
- Mark Absent.
- Update attendance with an audit trail.

Student:

- View attendance history.
- View monthly attendance.
- View attendance percentage.

Formula:

Attendance Percentage =
(Present Classes / Total Eligible Classes) × 100

Prevent duplicate attendance records for the same student, batch and class session.

Document holiday, cancelled-class and approved-leave handling.

# 13. STUDENT PROGRESS TRACKING

Track:

- Completed lectures.
- Pending lectures.
- Assignment submissions.
- Assignment marks.
- Quiz scores.
- Attendance percentage.
- Course completion percentage.

Calculate progress from actual database records.

Document the completion formula.

Only issue course completion when configured completion conditions are met.

# 14. CERTIFICATE MANAGEMENT

Implement certificate generation.

Certificate must contain:

- Institute name and logo.
- Student name.
- Course name.
- Completion date.
- Unique certificate number.
- Verification code.
- Authorized signature area.

Features:

- Generate PDF.
- Download certificate.
- View certificate.
- Verify certificate through a public verification page.
- Prevent duplicate unauthorized issuance.

Use Python ReportLab for server-side PDF generation.

# 15. PAYMENT AND FEE MANAGEMENT

Initial version must support manual payment records.

Payment fields:

- Student
- Course
- Total fee
- Paid amount
- Pending amount
- Payment date
- Payment method
- Transaction reference
- Payment status

Statuses:

- Paid
- Partially Paid
- Pending
- Failed
- Refunded

Features:

- Record full payment.
- Record partial payment.
- View payment history.
- Calculate outstanding fees.
- Generate PDF receipt.
- Student-wise fee report.
- Course-wise fee report.
- Admin payment dashboard.

If an online gateway is introduced later, verify payment through trusted backend callbacks/webhooks. Never store raw card information.

# 16. NOTIFICATION AND ANNOUNCEMENT MANAGEMENT

Implement in-app notifications.

Notification events:

- New course announcement.
- New batch announcement.
- New lecture.
- New study material.
- Assignment creation.
- Assignment deadline reminder.
- Quiz announcement.
- Evaluation result.
- Payment reminder.
- General institute announcement.

Features:

- Notification dropdown.
- Notification center.
- Read/unread status.
- Mark all as read.
- Role-based notifications.
- Batch-based announcements.
- Optional SMTP email integration.

Email settings must be configurable through environment variables.

# 17. REPORTS AND ANALYTICS

Admin reports:

- Student enrollment report.
- Course-wise students.
- Batch performance.
- Instructor activity.
- Attendance report.
- Assignment report.
- Quiz performance.
- Revenue report.
- Pending fee report.

Instructor reports:

- Assigned batch attendance.
- Student progress.
- Assignment evaluation.
- Quiz performance.

Student reports:

- Personal attendance.
- Course completion.
- Assignment performance.
- Quiz results.

Add:

- Date filters.
- Course filters.
- Batch filters.
- Search.
- Export CSV.
- Export Excel.
- Export PDF.

Use Recharts for actual database-driven analytics.

# 18. FRONTEND UI/UX DESIGN SYSTEM

Create a premium, modern, professional SaaS dashboard.

Design inspiration:

- Modern SaaS administration dashboards.
- Linear-style interface.
- Stripe-style analytics.
- Modern educational platforms.
- Premium glassmorphism elements.

Color palette:

Primary: #4F46E5
Secondary: #06B6D4
Accent: #8B5CF6
Background: #F8FAFC
Surface: #FFFFFF
Text: #0F172A
Muted: #64748B
Success: #16A34A
Warning: #F59E0B
Danger: #EF4444

Design requirements:

- Beautiful sidebar navigation.
- Responsive top navbar.
- Mobile hamburger menu.
- Profile dropdown.
- Notification dropdown.
- Breadcrumb navigation.
- Modern dashboard cards.
- Gradient backgrounds.
- Beautiful tables.
- Rounded cards.
- Soft shadows.
- Professional typography.
- Consistent spacing.
- Responsive grids.
- Smooth transitions.
- Attractive login screens.
- Modern forms.
- Beautiful empty states.
- Loading skeletons.
- Confirmation dialogs.
- Toast notifications.

Create a reusable design system.

All components must be consistent across Admin, Instructor and Student dashboards.

## AOS ANIMATIONS

Install and configure AOS.

Implement:

- data-aos="fade-up"
- data-aos="fade-down"
- data-aos="fade-right"
- data-aos="fade-left"
- data-aos="zoom-in"
- data-aos="flip-up"

Use animations for:

- Dashboard KPI cards.
- Course cards.
- Login pages.
- Section headings.
- Statistics.
- Content sections.
- Tables and panels where appropriate.

Configure AOS once in the application entry point.

Avoid excessive animation.

Respect prefers-reduced-motion accessibility settings.

Use Framer Motion selectively for interactive transitions.

# 19. REUSABLE FRONTEND COMPONENTS

Create reusable components:

components/
  common/
    Button.jsx
    Input.jsx
    Select.jsx
    Textarea.jsx
    Checkbox.jsx
    Badge.jsx
    Avatar.jsx
    Loader.jsx
    Skeleton.jsx
    Modal.jsx
    ConfirmDialog.jsx
    Dropdown.jsx
    Tooltip.jsx
    Pagination.jsx
    SearchInput.jsx
    EmptyState.jsx
    ErrorState.jsx
    PageHeader.jsx
    Breadcrumb.jsx
    FileUpload.jsx
    DataTable.jsx
    StatCard.jsx
    ProgressBar.jsx
    StatusBadge.jsx

  layout/
    AppLayout.jsx
    AdminLayout.jsx
    InstructorLayout.jsx
    StudentLayout.jsx
    Sidebar.jsx
    Header.jsx
    Footer.jsx
    MobileSidebar.jsx
    NotificationDropdown.jsx
    ProfileDropdown.jsx

  charts/
    EnrollmentChart.jsx
    RevenueChart.jsx
    AttendanceChart.jsx
    PerformanceChart.jsx

  forms/
    LoginForm.jsx
    RegisterForm.jsx
    CourseForm.jsx
    BatchForm.jsx
    StudentForm.jsx
    InstructorForm.jsx
    AssignmentForm.jsx
    QuizForm.jsx
    AttendanceForm.jsx
    PaymentForm.jsx

Every component must be reusable, responsive and maintainable.

# 20. COMPLETE FRONTEND ROUTING

Use React Router DOM.

Public routes:

/
 /login
 /register
 /forgot-password
 /reset-password
 /verify-certificate/:certificateId

Admin routes:

/admin/dashboard
/admin/users
/admin/students
/admin/instructors
/admin/courses
/admin/categories
/admin/modules
/admin/batches
/admin/enrollments
/admin/lectures
/admin/materials
/admin/assignments
/admin/submissions
/admin/quizzes
/admin/attendance
/admin/payments
/admin/certificates
/admin/notifications
/admin/announcements
/admin/reports
/admin/settings
/admin/profile

Instructor routes:

/instructor/dashboard
/instructor/courses
/instructor/batches
/instructor/students
/instructor/lectures
/instructor/materials
/instructor/assignments
/instructor/submissions
/instructor/evaluations
/instructor/quizzes
/instructor/attendance
/instructor/progress
/instructor/announcements
/instructor/notifications
/instructor/profile

Student routes:

/student/dashboard
/student/courses
/student/course/:id
/student/lectures
/student/materials
/student/assignments
/student/submissions
/student/assignments/:id/submit
/student/quizzes
/student/quiz/:id
/student/results
/student/attendance
/student/progress
/student/certificates
/student/payments
/student/notifications
/student/profile

Implement:

- PublicRoute.
- ProtectedRoute.
- RoleProtectedRoute.
- NotFound page.
- Unauthorized page.
- Redirect according to user role.
- Route-level lazy loading.
- Error boundaries.

Every route must have a real page component.

# 21. FRONTEND FOLDER STRUCTURE

Create the following architecture:

frontend/
│
├── public/
│   ├── images/
│   ├── logos/
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── charts/
│   │   ├── forms/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── admin/
│   │   ├── instructor/
│   │   ├── student/
│   │   └── errors/
│   │
│   ├── layouts/
│   ├── routes/
│   ├── hooks/
│   ├── context/
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   ├── studentService.js
│   │   ├── instructorService.js
│   │   ├── batchService.js
│   │   ├── assignmentService.js
│   │   ├── quizService.js
│   │   ├── attendanceService.js
│   │   ├── paymentService.js
│   │   └── reportService.js
│   │
│   ├── utils/
│   ├── validations/
│   ├── constants/
│   ├── styles/
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md

# 22. BACKEND FOLDER STRUCTURE

Create a modular FastAPI architecture:

backend/
│
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── jwt.py
│   │   ├── permissions.py
│   │   └── logging.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── course.py
│   │   ├── course_category.py
│   │   ├── course_module.py
│   │   ├── batch.py
│   │   ├── enrollment.py
│   │   ├── lecture.py
│   │   ├── study_material.py
│   │   ├── assignment.py
│   │   ├── submission.py
│   │   ├── quiz.py
│   │   ├── question.py
│   │   ├── quiz_attempt.py
│   │   ├── attendance.py
│   │   ├── certificate.py
│   │   ├── payment.py
│   │   ├── notification.py
│   │   └── announcement.py
│   │
│   ├── schemas/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── students.py
│   │   ├── instructors.py
│   │   ├── courses.py
│   │   ├── categories.py
│   │   ├── batches.py
│   │   ├── enrollments.py
│   │   ├── lectures.py
│   │   ├── materials.py
│   │   ├── assignments.py
│   │   ├── submissions.py
│   │   ├── quizzes.py
│   │   ├── attendance.py
│   │   ├── progress.py
│   │   ├── certificates.py
│   │   ├── payments.py
│   │   ├── notifications.py
│   │   ├── announcements.py
│   │   └── reports.py
│   │
│   ├── services/
│   ├── dependencies/
│   ├── middleware/
│   ├── utils/
│   ├── storage/
│   └── templates/
│
├── migrations/
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_courses.py
│   ├── test_batches.py
│   ├── test_assignments.py
│   ├── test_quizzes.py
│   ├── test_attendance.py
│   └── test_payments.py
│
├── scripts/
│   ├── create_admin.py
│   ├── seed_database.py
│   └── backup_database.py
│
├── uploads/
├── requirements.txt
├── requirements-dev.txt
├── alembic.ini
├── .env.example
├── .gitignore
├── Dockerfile
└── README.md

# 23. API DEVELOPMENT

Use versioned REST APIs:

/api/v1/

Implement CRUD endpoints for every module.

Example:

GET /api/v1/courses
POST /api/v1/courses
GET /api/v1/courses/{id}
PUT /api/v1/courses/{id}
DELETE /api/v1/courses/{id}

Follow the same standard for all modules.

API requirements:

- Pydantic request/response schemas.
- Correct HTTP status codes.
- Pagination.
- Filtering.
- Sorting.
- Search.
- Validation.
- Authentication.
- Role authorization.
- Resource authorization.
- Consistent error responses.
- OpenAPI documentation.
- Swagger UI.
- Health-check endpoint.

Use appropriate HTTP codes:

200, 201, 204, 400, 401, 403, 404, 409, 422, 429 and 500.

Use service-layer business logic instead of placing all logic inside routers.

# 24. ENVIRONMENT VARIABLES

Never hardcode credentials.

Create backend/.env.example:

APP_NAME=LMS
APP_ENV=development
DEBUG=true
SECRET_KEY=replace_with_secure_random_secret
JWT_SECRET_KEY=replace_with_secure_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

DB_HOST=localhost
DB_PORT=3306
DB_NAME=lms_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3306/lms_db

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:5173

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

STORAGE_PROVIDER=local
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_REGION=

MAX_UPLOAD_SIZE_MB=50
ALLOWED_FILE_EXTENSIONS=pdf,ppt,pptx,doc,docx,zip,jpg,jpeg,png

LOG_LEVEL=INFO

Create frontend/.env.example:

VITE_APP_NAME=LMS
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_ENV=development

Create production environment documentation.

Use separate environment configurations for:

- Local development.
- Testing.
- Staging.
- Production.

Important:

- Do not commit actual .env files.
- Add .env to .gitignore.
- Never expose backend secrets in frontend environment variables.
- Validate required environment settings during application startup.
- Use secure database credentials in production.
- Configure CORS using exact approved frontend origins.

# 25. THIRD-PARTY PACKAGES AND INTEGRATIONS

Use only necessary, maintained dependencies.

Frontend integrations:

- AOS animations.
- Recharts analytics.
- Axios API client.
- React Router.
- Lucide icons.
- SweetAlert2 confirmations.
- Toast notifications.
- React Hook Form.
- Zod validation.
- File upload.
- PDF and Excel export.

Backend integrations:

- MySQL.
- SQLAlchemy.
- Alembic.
- JWT.
- Password hashing.
- SMTP email.
- Persistent file storage.
- ReportLab.
- CSV and Excel export.
- Rate limiting.

Optional production integrations:

- Cloudinary or S3-compatible storage.
- SMTP email provider.
- Razorpay payment gateway in a future approved phase.

Do not introduce integrations that are not required by the project scope.

# 26. SECURITY REQUIREMENTS

Implement:

- JWT expiration.
- Secure password hashing.
- Role-based permissions.
- Resource-level permissions.
- Input validation.
- SQL injection prevention.
- CORS restrictions.
- Rate limiting.
- Secure file uploads.
- Private file authorization.
- Safe error responses.
- HTTPS in production.
- Secure secret management.
- Audit trails for sensitive changes.
- Protection against unauthorized student record access.
- Protection against unauthorized marks and payment modification.

Never log passwords, tokens or sensitive credentials.

Never trust data submitted by the browser for quiz scores, attendance or payment verification.

# 27. TESTING REQUIREMENTS

Backend:

- Pytest.
- API integration tests.
- Authentication tests.
- Authorization tests.
- CRUD tests.
- Database relationship tests.
- File upload tests.
- Quiz calculation tests.
- Attendance tests.
- Payment tests.

Frontend:

- Form validation.
- Route protection.
- Navigation.
- API integration.
- Error handling.
- Responsive testing.
- Component testing.

Prepare a test report containing:

- Test ID.
- Module.
- Test steps.
- Expected result.
- Actual result.
- Status.
- Issues found.

Do not mark a feature complete until it has been tested.

# 28. DEPLOYMENT AND HOSTING

Prepare deployment-ready configuration.

Frontend hosting:

- Vercel or Netlify.

Backend hosting:

- Render or another approved Python hosting platform.

Database:

- Managed production MySQL 8+.

File storage:

- Persistent object storage for production.

Create:

- Frontend Dockerfile where appropriate.
- Backend Dockerfile.
- Docker Compose for local development.
- Production environment configuration.
- Database migration instructions.
- Health-check endpoint.
- CORS production configuration.
- Deployment README.

Health endpoint:

GET /api/v1/health

Deployment must support:

- Persistent MySQL data.
- Persistent file storage.
- HTTPS.
- Production JWT secrets.
- Production database URL.
- Production frontend URL.
- Correct CORS.
- Startup migrations through a controlled deployment step.
- Logging and error monitoring.

Create deployment instructions for Windows and Linux.

# 29. DOCUMENTATION REQUIREMENTS

Create the following:

docs/
│
├── 01-requirements/
│   ├── srs-notes.md
│   └── use-cases.md
│
├── 02-design/
│   ├── wireframes/
│   ├── erd.png
│   └── data-dictionary.md
│
├── 03-business-rules/
│   └── policies.md
│
├── 04-architecture/
│   ├── architecture.md
│   └── security.md
│
├── 05-api/
│   ├── api-endpoints.md
│   └── postman_collection.json
│
├── 06-modules/
│   ├── auth.md
│   ├── courses.md
│   ├── batches.md
│   ├── lectures.md
│   ├── assignments.md
│   ├── quizzes.md
│   ├── attendance.md
│   ├── payments.md
│   └── reports.md
│
├── 07-prompts/
│   ├── master-prompt.md
│   ├── prompt-log.md
│   └── module-prompts/
│
├── 08-testing/
│   ├── test-plan.md
│   ├── test-report.md
│   └── known-issues.md
│
├── 09-deployment/
│   ├── env-guide.md
│   ├── deployment-guide.md
│   └── backup-restore.md
│
├── 10-user-manual/
│   ├── admin.md
│   ├── instructor.md
│   └── student.md
│
├── 11-reports/
│   ├── progress-log.md
│   ├── changelog.md
│   └── final-report.md
│
└── screenshots/

Also create:

- README.md
- CHANGELOG.md
- LICENSE
- .gitignore

Document every significant development phase.

# 30. VIBE CODING EXECUTION WORKFLOW

IMPORTANT: Do not attempt to generate the entire application in one uncontrolled response.

Work in structured phases.

## PHASE 1 – Requirement Analysis

- Read this entire prompt.
- Analyze the project scope.
- Create use cases.
- Define business rules.
- Create UI wireframes.
- Design database ERD.
- Finalize folder architecture.
- Prepare implementation plan.

Deliverable: Requirement and architecture documentation.

## PHASE 2 – Project Initialization

- Initialize React + Vite.
- Configure Tailwind CSS 4.
- Install frontend dependencies.
- Initialize FastAPI.
- Configure SQLAlchemy.
- Configure MySQL.
- Configure Alembic.
- Create .env.example files.
- Create project folders.

Deliverable: Both applications running locally.

## PHASE 3 – Database Development

- Create all database models.
- Create relationships.
- Create constraints.
- Create indexes.
- Generate Alembic migrations.
- Create seed scripts.
- Test database connections.

Deliverable: Complete MySQL schema.

## PHASE 4 – Authentication

- Implement login.
- Implement registration where authorized.
- Implement JWT.
- Implement refresh tokens.
- Implement password hashing.
- Implement role authorization.
- Implement protected routes.
- Test all three roles.

Deliverable: Complete authentication.

## PHASE 5 – Admin Dashboard

Build every Admin module and connect it to real APIs.

## PHASE 6 – Instructor Dashboard

Build every Instructor module and connect it to real APIs.

## PHASE 7 – Student Dashboard

Build every Student module and connect it to real APIs.

## PHASE 8 – Learning Modules

Implement:

- Courses.
- Batches.
- Enrollments.
- Lectures.
- Materials.
- Assignments.
- Submissions.
- Quizzes.
- Attendance.
- Progress.

## PHASE 9 – Certificates and Payments

Implement PDF certificates, verification, manual payments and receipts.

## PHASE 10 – Notifications and Analytics

Implement notifications, announcements, reports, charts and exports.

## PHASE 11 – Testing and Security

Run all backend and frontend tests.

Fix all critical and high-severity bugs.

## PHASE 12 – Deployment

Prepare production environments, deploy frontend and backend, connect managed MySQL and verify complete application workflows.

# 31. STRICT DEVELOPMENT RULES

Follow these rules throughout development:

1. Never create fake functionality.
2. Never use hardcoded dashboard statistics.
3. Never use localStorage as a replacement for backend authentication or MySQL persistence.
4. Never bypass backend authorization.
5. Never expose secrets in frontend code.
6. Never skip database migrations.
7. Never create duplicate components unnecessarily.
8. Never use outdated Tailwind CSS 3 instructions.
9. Never leave broken imports.
10. Never leave placeholder buttons.
11. Never leave incomplete API integrations.
12. Never ignore frontend validation.
13. Never ignore backend validation.
14. Never expose private files.
15. Never skip testing.
16. Never overwrite working modules without checking dependencies.
17. Maintain a clean, modular architecture.
18. Use reusable components.
19. Follow consistent naming conventions.
20. Update documentation after every significant change.

# 32. AI CODING AGENT RESPONSE FORMAT

For every phase or module, provide:

1. Objective.
2. Requirements analysis.
3. Files and folders to create.
4. Complete implementation code.
5. API endpoints.
6. Database changes.
7. Frontend integration.
8. Environment variable changes.
9. Installation commands.
10. Execution commands.
11. Test cases.
12. Expected results.
13. Known limitations.
14. Manual verification steps.

After implementing a module:

- Run relevant tests.
- Check imports.
- Check API connectivity.
- Check database operations.
- Check frontend responsiveness.
- Fix errors before proceeding.

Do not silently skip any requirement.

If a requirement is unclear, list the assumption and ask for clarification where necessary.

# 33. FINAL PROJECT ACCEPTANCE CRITERIA

The application is complete only when:

- Admin, Instructor and Student login works.
- Each role has correct permissions.
- Admin can manage students and instructors.
- Admin can manage courses and batches.
- Instructors can manage assigned learning content.
- Students can access only enrolled courses.
- Assignments can be submitted and evaluated.
- Quizzes work with server-side scoring.
- Attendance calculations are accurate.
- Student progress is database-driven.
- Certificates can be generated and verified.
- Payment records are consistent.
- Notifications work.
- Reports and exports work.
- All major screens use real backend APIs.
- MySQL persistence works.
- No critical security vulnerabilities remain.
- Responsive design works on mobile and desktop.
- Frontend and backend are deployed.
- Production environment variables are configured.
- API documentation is accessible.
- Tests and documentation are complete.

# 34. FINAL DELIVERABLES

Provide the complete source code for:

1. React frontend.
2. FastAPI backend.
3. MySQL database schema.
4. SQLAlchemy models.
5. Alembic migrations.
6. JWT authentication.
7. Role-based dashboards.
8. All CRUD modules.
9. REST APIs.
10. Responsive GUI.
11. AOS animations.
12. Reusable frontend components.
13. File upload/download.
14. PDF certificates.
15. Payment records and receipts.
16. Reports and analytics.
17. Automated tests.
18. Docker configuration.
19. Environment example files.
20. Deployment documentation.
21. ERD.
22. Postman collection.
23. Complete README.
24. User manuals.
25. AI prompt documentation.

# 35. START DEVELOPMENT NOW

Your first task is NOT to generate random code.

First analyze the entire project specification and create:

1. Complete project architecture.
2. Complete frontend and backend folder structures.
3. Database ERD.
4. Database table and relationship plan.
5. API endpoint inventory.
6. Three-role permission matrix.
7. UI/UX wireframe plan.
8. Environment variable plan.
9. Development milestone checklist.

After completing Phase 1, start Phase 2.

Implement the project module by module.

Maintain existing working code, verify each integration and never claim a feature is completed until it has been implemented and tested.

**FINAL OBJECTIVE: Deliver a beautiful, secure, fully functional, production-ready Learning Management System using React 19, Tailwind CSS 4, Python FastAPI, MySQL, SQLAlchemy 2.x and JWT authentication.**