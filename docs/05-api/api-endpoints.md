# Enterprise LMS — Complete REST API Endpoint Inventory (`/api/v1`)

**Document Version:** 1.0.0  
**Base URL:** `http://localhost:8000/api/v1`  
**Authentication Header:** `Authorization: Bearer <access_token>`  

---

## 1. Standard Response Envelope & Error Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 142
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "BATCH_CAPACITY_EXCEEDED",
    "message": "Batch FSWD-2026A has reached its maximum capacity of 30 students.",
    "details": null
  }
}
```

---

## 2. Complete 22-Module Endpoint Inventory

### 2.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | `PUBLIC` | Authenticate with email & password; returns access + refresh tokens & user profile |
| `POST` | `/api/v1/auth/refresh` | `PUBLIC` (Refresh Token) | Rotate refresh token and issue new access token |
| `POST` | `/api/v1/auth/logout` | `ADMIN, INSTRUCTOR, STUDENT` | Revoke active refresh token in database |
| `POST` | `/api/v1/auth/forgot-password` | `PUBLIC` | Generate time-bound password reset token |
| `POST` | `/api/v1/auth/reset-password` | `PUBLIC` | Verify reset token and update account password |
| `GET` | `/api/v1/auth/me` | `ADMIN, INSTRUCTOR, STUDENT` | Return current authenticated user profile & role permissions |

### 2.2 Users (`/api/v1/users`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/users` | `ADMIN` | Paginated list of users with role, status, and search filters |
| `POST` | `/api/v1/users` | `ADMIN` | Create a new user (`ADMIN`, `INSTRUCTOR`, or `STUDENT`) |
| `GET` | `/api/v1/users/me` | `ADMIN, INSTRUCTOR, STUDENT` | Retrieve own user profile |
| `PUT` | `/api/v1/users/me` | `ADMIN, INSTRUCTOR, STUDENT` | Update own profile name, phone, avatar, or password |
| `GET` | `/api/v1/users/{user_id}` | `ADMIN` | Get full user details by ID |
| `PUT` | `/api/v1/users/{user_id}` | `ADMIN` | Update user details, role, or active status |
| `PATCH`| `/api/v1/users/{user_id}/status` | `ADMIN` | Activate or deactivate user account (`is_active`) |

### 2.3 Students (`/api/v1/students`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/students` | `ADMIN, INSTRUCTOR` | List students (Instructors see students in their assigned batches) |
| `POST` | `/api/v1/students` | `ADMIN` | Onboard a new student account |
| `GET` | `/api/v1/students/{student_id}` | `ADMIN, INSTRUCTOR, STUDENT(Own)` | Retrieve student profile, enrollments, attendance & fee summary |
| `GET` | `/api/v1/students/{student_id}/transcript` | `ADMIN, INSTRUCTOR, STUDENT(Own)` | Consolidated academic transcript across all courses |

### 2.4 Instructors (`/api/v1/instructors`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/instructors` | `PUBLIC / ALL` | List instructors with specialization, bio, and assigned batch counts |
| `POST` | `/api/v1/instructors` | `ADMIN` | Create user with `INSTRUCTOR` role + extended `instructors` profile |
| `GET` | `/api/v1/instructors/{instructor_id}` | `PUBLIC / ALL` | Get instructor profile and assigned active batches |
| `PUT` | `/api/v1/instructors/{instructor_id}` | `ADMIN, INSTRUCTOR(Own)` | Update instructor specialization, qualification, experience, and bio |

### 2.5 Course Categories (`/api/v1/categories`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | `PUBLIC / ALL` | List all active course categories |
| `POST` | `/api/v1/categories` | `ADMIN` | Create a new course category |
| `PUT` | `/api/v1/categories/{category_id}` | `ADMIN` | Update category name, slug, description, or status |
| `DELETE`| `/api/v1/categories/{category_id}` | `ADMIN` | Archive or delete category (if no courses attached) |

### 2.6 Courses & Modules (`/api/v1/courses`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/courses` | `PUBLIC / ALL` | List courses with category, level, search, and status filters |
| `POST` | `/api/v1/courses` | `ADMIN` | Create a new course |
| `GET` | `/api/v1/courses/{course_id}` | `PUBLIC / ALL` | Retrieve full course details with syllabus modules & lectures |
| `PUT` | `/api/v1/courses/{course_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Update course metadata or publication status |
| `DELETE`| `/api/v1/courses/{course_id}` | `ADMIN` | Safe archive or delete draft course |
| `GET` | `/api/v1/courses/{course_id}/modules` | `PUBLIC / ALL` | List ordered modules for a course |
| `POST` | `/api/v1/courses/{course_id}/modules` | `ADMIN, INSTRUCTOR(Scoped)` | Add a syllabus module to a course |
| `PUT` | `/api/v1/courses/{course_id}/modules/{module_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Update or reorder a course module |

### 2.7 Batches (`/api/v1/batches`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/batches` | `ADMIN, INSTRUCTOR, STUDENT` | List batches (filtered by course, instructor, status) |
| `POST` | `/api/v1/batches` | `ADMIN` | Create a new batch cohort and assign instructor & capacity |
| `GET` | `/api/v1/batches/{batch_id}` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Enrolled)` | Get batch details, capacity utilization, and schedule |
| `PUT` | `/api/v1/batches/{batch_id}` | `ADMIN` | Update batch schedule, instructor assignment, capacity, or status |
| `GET` | `/api/v1/batches/{batch_id}/students` | `ADMIN, INSTRUCTOR(Scoped)` | List all enrolled students in the batch with attendance & progress |

### 2.8 Enrollments (`/api/v1/enrollments`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/enrollments` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | List enrollments with completion, attendance, and fee balances |
| `POST` | `/api/v1/enrollments` | `ADMIN` | Enroll student into course & batch (enforces capacity & initializes fee ledger) |
| `GET` | `/api/v1/enrollments/{enrollment_id}` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | Get detailed enrollment record |
| `PATCH`| `/api/v1/enrollments/{enrollment_id}/status` | `ADMIN` | Update enrollment status (`ACTIVE`, `COMPLETED`, `DROPPED`, `SUSPENDED`) |

### 2.9 Lectures (`/api/v1/lectures`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/lectures` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | List lectures by `course_id` or `module_id` |
| `POST` | `/api/v1/lectures` | `ADMIN, INSTRUCTOR(Scoped)` | Create a new lecture inside a module |
| `GET` | `/api/v1/lectures/{lecture_id}` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | Retrieve lecture stream URL, notes, and attached materials |
| `PUT` | `/api/v1/lectures/{lecture_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Update lecture details, video URL, duration, or sort order |
| `DELETE`| `/api/v1/lectures/{lecture_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Remove lecture and recalculate course completion |

### 2.10 Study Materials (`/api/v1/materials`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/materials` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | List downloadable study materials for a course or lecture |
| `POST` | `/api/v1/materials` | `ADMIN, INSTRUCTOR(Scoped)` | Upload or link a new study material (multipart or URL) |
| `GET` | `/api/v1/materials/{material_id}/download` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | Securely download study material file |
| `DELETE`| `/api/v1/materials/{material_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Delete study material |

### 2.11 Assignments (`/api/v1/assignments`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/assignments` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | List assignments for a course or batch |
| `POST` | `/api/v1/assignments` | `ADMIN, INSTRUCTOR(Scoped)` | Create a new assignment with deadline, max marks, and late policy |
| `GET` | `/api/v1/assignments/{assignment_id}` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | Get assignment details and rubric |
| `PUT` | `/api/v1/assignments/{assignment_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Update assignment instructions or due date |
| `DELETE`| `/api/v1/assignments/{assignment_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Delete assignment if no graded submissions exist |

### 2.12 Assignment Submissions & Grading (`/api/v1/submissions`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/submissions` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | List submissions filtered by assignment, batch, or student |
| `POST` | `/api/v1/submissions` | `STUDENT(Enrolled)` | Submit or resubmit assignment response / file upload |
| `GET` | `/api/v1/submissions/{submission_id}` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | Get submission details and grading feedback |
| `POST` | `/api/v1/submissions/{submission_id}/grade` | `ADMIN, INSTRUCTOR(Scoped)` | Grade submission, apply late penalty if applicable, & update progress |

### 2.13 Quizzes, Questions & Timed Attempts (`/api/v1/quizzes`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/quizzes` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | List quizzes for a course or batch |
| `POST` | `/api/v1/quizzes` | `ADMIN, INSTRUCTOR(Scoped)` | Create a new timed quiz |
| `GET` | `/api/v1/quizzes/{quiz_id}` | `ADMIN, INSTRUCTOR, STUDENT(Enrolled)` | Get quiz details (options `is_correct` hidden for students) |
| `POST` | `/api/v1/quizzes/{quiz_id}/questions` | `ADMIN, INSTRUCTOR(Scoped)` | Add a question and options to a quiz |
| `POST` | `/api/v1/quizzes/{quiz_id}/start` | `STUDENT(Enrolled)` | Start timed attempt; sets server `started_at` and `expires_at` |
| `POST` | `/api/v1/quizzes/attempts/{attempt_id}/events` | `STUDENT(Own)` | Log anti-cheat telemetry event (`TAB_SWITCH`, `FULLSCREEN_EXIT`) |
| `POST` | `/api/v1/quizzes/attempts/{attempt_id}/submit` | `STUDENT(Own)` | Submit quiz answers, verify timer, auto-grade & update progress |
| `GET` | `/api/v1/quizzes/{quiz_id}/attempts` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | List attempts, scores, and anti-cheat warning counts |

### 2.14 Attendance (`/api/v1/attendance`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/attendance` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | Query attendance records by batch, student, and date range |
| `POST` | `/api/v1/attendance/bulk` | `ADMIN, INSTRUCTOR(Scoped)` | Mark or update daily attendance for an entire batch roster |
| `GET` | `/api/v1/attendance/summary/{batch_id}` | `ADMIN, INSTRUCTOR(Scoped)` | Get batch attendance matrix and low-attendance (`<75%`) alerts |
| `GET` | `/api/v1/attendance/student/{student_id}` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | Get exact attendance formula breakdown for a student |

### 2.15 Lecture & Course Progress (`/api/v1/progress`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/progress/course/{course_id}` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | Get weighted completion breakdown (`50% L + 30% A + 20% Q`) |
| `POST` | `/api/v1/progress/lectures/{lecture_id}` | `STUDENT(Enrolled)` | Record watch time heartbeat or mark lecture completed |

### 2.16 Certificates & Public Verification (`/api/v1/certificates`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/certificates` | `ADMIN, INSTRUCTOR(Scoped), STUDENT(Own)` | List issued certificates |
| `POST` | `/api/v1/certificates/issue` | `ADMIN` | Validate eligibility gates and issue certificate for an enrollment |
| `GET` | `/api/v1/certificates/verify/{code}` | `PUBLIC` | Publicly verify certificate authenticity by code or UUID |
| `GET` | `/api/v1/certificates/{certificate_id}/download` | `ADMIN, STUDENT(Own)` | Download official certificate PDF |
| `POST` | `/api/v1/certificates/{certificate_id}/revoke` | `ADMIN` | Revoke certificate with mandatory audit reason |

### 2.17 Payments & Fee Receipts (`/api/v1/payments`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/payments` | `ADMIN, STUDENT(Own)` | List fee payments and installment history |
| `POST` | `/api/v1/payments` | `ADMIN` | Record installment payment, update `Paid + Pending = Total`, & issue receipt |
| `GET` | `/api/v1/payments/receipts/{receipt_no}` | `ADMIN, STUDENT(Own)` | Retrieve payment receipt voucher details / PDF |
| `GET` | `/api/v1/payments/pending` | `ADMIN` | List enrollments with pending fee balances (Fee Defaulters report) |

### 2.18 Notifications (`/api/v1/notifications`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | `ADMIN, INSTRUCTOR, STUDENT` | List own notifications with unread count |
| `PATCH`| `/api/v1/notifications/{notification_id}/read` | `ADMIN, INSTRUCTOR, STUDENT` | Mark a single notification as read |
| `POST` | `/api/v1/notifications/read-all` | `ADMIN, INSTRUCTOR, STUDENT` | Mark all unread notifications as read |

### 2.19 Announcements (`/api/v1/announcements`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/announcements` | `ADMIN, INSTRUCTOR, STUDENT` | List active announcements scoped to user's role, courses, and batches |
| `POST` | `/api/v1/announcements` | `ADMIN, INSTRUCTOR(Scoped)` | Publish a new global, role, course, or batch announcement |
| `DELETE`| `/api/v1/announcements/{announcement_id}` | `ADMIN, INSTRUCTOR(Own)` | Delete an announcement |

### 2.20 Reports & Analytics (`/api/v1/reports`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/dashboard` | `ADMIN, INSTRUCTOR, STUDENT` | Role-specific KPI dashboard summary metrics |
| `GET` | `/api/v1/reports/revenue` | `ADMIN` | Monthly revenue, collection efficiency, and pending dues report |
| `GET` | `/api/v1/reports/attendance-export` | `ADMIN, INSTRUCTOR(Scoped)` | Export batch attendance register as CSV |
| `GET` | `/api/v1/reports/gradebook-export` | `ADMIN, INSTRUCTOR(Scoped)` | Export batch assignment & quiz gradebook as CSV |

### 2.21 System Settings & Audit Logs (`/api/v1/settings`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/settings` | `ADMIN` | List all configurable institutional system settings |
| `PUT` | `/api/v1/settings` | `ADMIN` | Update system settings (attendance threshold, completion weights, etc.) |
| `GET` | `/api/v1/settings/audit-logs` | `ADMIN` | Query immutable `audit_logs` with actor, action, and entity filters |

### 2.22 System Health (`/api/v1/health`)
| Method | Endpoint | Roles Allowed | Description |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | `PUBLIC` | Readiness & liveness check returning DB connection status, version, and table count |
