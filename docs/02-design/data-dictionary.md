# Enterprise LMS — Complete 31-Table MySQL 8 Data Dictionary

**Document Version:** 1.0.0  
**Database Engine:** MySQL 8.0+ (`InnoDB`, `utf8mb4_unicode_ci`)  
**ORM Layer:** SQLAlchemy 2.x Declarative Mapped Models  

---

## 1. Domain Grouping Overview (31 Tables)

| Domain Group | Tables Included | Count |
| :--- | :--- | :---: |
| **1. Identity, Auth & Security** | `roles`, `users`, `instructors`, `refresh_tokens`, `password_reset_tokens` | 5 |
| **2. Curriculum & Content** | `course_categories`, `courses`, `course_modules`, `lectures`, `study_materials` | 5 |
| **3. Cohorts, Enrollment & Progress** | `batches`, `batch_students`, `enrollments`, `lecture_progress`, `attendance` | 5 |
| **4. Assignments & Grading** | `assignments`, `submissions`, `assignment_feedback` | 3 |
| **5. Timed Quizzes & Telemetry** | `quizzes`, `questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `quiz_attempt_events` | 6 |
| **6. Credentials & Finance** | `certificates`, `payments`, `payment_receipts` | 3 |
| **7. Communication & Governance** | `notifications`, `announcements`, `audit_logs`, `system_settings` | 4 |
| **TOTAL** | **All Relational Tables** | **31** |

---

## 2. Referential Integrity & Deletion Strategy Policy

- **`RESTRICT` (Safe Guard):** Applied to core master entities (`roles`, `users`, `courses`, `batches`, `enrollments`, `payments`, `certificates`) so historical academic and financial records can never be accidentally orphaned or wiped via cascade.
- **`CASCADE` (Owned Child Entities):** Applied strictly to composition children (`course_modules -> lectures -> study_materials`, `quizzes -> questions -> quiz_options`, `quiz_attempts -> quiz_answers / quiz_attempt_events`, `users -> refresh_tokens / password_reset_tokens`).
- **`SET NULL` (Optional Audit/Grader References):** Applied to nullable actor pointers (`audit_logs.actor_id`, `courses.created_by`, `assignment_feedback.graded_by`).

---

## 3. Detailed Table Schemas (1 to 31)

### Table 01: `roles`
Stores system role definitions (`ADMIN`, `INSTRUCTOR`, `STUDENT`).
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Role primary key |
| `name` | `VARCHAR(50)` | `NOT NULL, UNIQUE (uk_roles_name)` | — | `ADMIN`, `INSTRUCTOR`, `STUDENT` |
| `description` | `VARCHAR(255)` | `NULL` | `NULL` | Human-readable role summary |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 02: `users`
Core user identity account for all actors.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | User primary key |
| `role_id` | `INT UNSIGNED` | `FK -> roles(id) ON DELETE RESTRICT, INDEX` | — | Assigned role ID |
| `full_name` | `VARCHAR(120)` | `NOT NULL, INDEX` | — | Full legal name |
| `email` | `VARCHAR(191)` | `NOT NULL, UNIQUE (uk_users_email)` | — | Login email address |
| `phone` | `VARCHAR(30)` | `NULL, INDEX` | `NULL` | Contact number |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | — | Argon2id / bcrypt password digest |
| `avatar_url` | `VARCHAR(500)` | `NULL` | `NULL` | Profile photo path/URL |
| `is_active` | `BOOLEAN` | `NOT NULL, INDEX` | `TRUE` | Soft active status toggle |
| `last_login_at` | `DATETIME` | `NULL` | `NULL` | Most recent login timestamp |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Last update timestamp |

### Table 03: `instructors`
Extended faculty profile linked 1:1 with `users`.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Instructor profile ID |
| `user_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, UNIQUE` | — | Associated user account |
| `employee_code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | — | Institutional faculty code |
| `specialization` | `VARCHAR(150)` | `NOT NULL` | — | Domain expertise |
| `qualification` | `VARCHAR(150)` | `NULL` | `NULL` | Academic degrees/certifications |
| `experience_years`| `DECIMAL(4,1)` | `NOT NULL` | `0.0` | Years of teaching/industry exp |
| `bio` | `TEXT` | `NULL` | `NULL` | Public instructor biography |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Profile creation timestamp |

### Table 04: `course_categories`
Taxonomy grouping for courses.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Category ID |
| `name` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | — | Category display name |
| `slug` | `VARCHAR(120)` | `NOT NULL, UNIQUE` | — | URL-safe slug |
| `description` | `TEXT` | `NULL` | `NULL` | Category overview |
| `is_active` | `BOOLEAN` | `NOT NULL, INDEX` | `TRUE` | Visibility status |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 05: `courses`
Master course catalog table.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Course ID |
| `category_id` | `INT UNSIGNED` | `FK -> course_categories(id) ON DELETE RESTRICT, INDEX` | — | Parent category |
| `code` | `VARCHAR(40)` | `NOT NULL, UNIQUE` | — | Course code (e.g., `CS-FS101`) |
| `title` | `VARCHAR(200)` | `NOT NULL, INDEX` | — | Course title |
| `slug` | `VARCHAR(220)` | `NOT NULL, UNIQUE` | — | URL slug |
| `description` | `TEXT` | `NULL` | `NULL` | Detailed syllabus summary |
| `level` | `ENUM('BEGINNER','INTERMEDIATE','ADVANCED')` | `NOT NULL` | `'BEGINNER'` | Difficulty tier |
| `duration_weeks` | `INT UNSIGNED` | `NOT NULL` | `12` | Standard duration in weeks |
| `base_fee` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Standard tuition fee |
| `thumbnail_url` | `VARCHAR(500)` | `NULL` | `NULL` | Cover image path |
| `status` | `ENUM('DRAFT','PUBLISHED','ARCHIVED')` | `NOT NULL, INDEX` | `'DRAFT'` | Publication lifecycle state |
| `created_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Author user ID |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Update timestamp |

### Table 06: `course_modules`
Ordered syllabus sections belonging to a course.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Module ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, INDEX` | — | Parent course |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Module title |
| `description` | `TEXT` | `NULL` | `NULL` | Learning objectives |
| `sort_order` | `INT UNSIGNED` | `NOT NULL, INDEX` | `1` | Sequence order within course |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 07: `batches`
Time-bound student cohorts for a specific course and assigned instructor.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Batch ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE RESTRICT, INDEX` | — | Associated course |
| `instructor_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Primary assigned instructor |
| `batch_code` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | — | Unique cohort code (`FSWD-2026A`) |
| `name` | `VARCHAR(150)` | `NOT NULL` | — | Batch display name |
| `start_date` | `DATE` | `NOT NULL, INDEX` | — | Cohort start date |
| `end_date` | `DATE` | `NOT NULL` | — | Cohort end date |
| `schedule_days` | `VARCHAR(100)` | `NULL` | `'Mon,Wed,Fri'` | Days of instruction |
| `time_slot` | `VARCHAR(80)` | `NULL` | `'10:00 AM - 12:00 PM'` | Class timing window |
| `max_capacity` | `INT UNSIGNED` | `NOT NULL` | `30` | Maximum allowed students |
| `current_strength`| `INT UNSIGNED` | `NOT NULL` | `0` | Currently active enrolled count |
| `status` | `ENUM('UPCOMING','ONGOING','COMPLETED','CANCELLED')` | `NOT NULL, INDEX` | `'UPCOMING'` | Cohort lifecycle status |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 08: `batch_students`
Junction roster mapping students to batches with seat status.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Roster row ID |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE RESTRICT, INDEX` | — | Target batch |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Enrolled student |
| `joined_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Assignment timestamp |
| `status` | `ENUM('ACTIVE','TRANSFERRED','DROPPED','COMPLETED')` | `NOT NULL` | `'ACTIVE'` | Batch membership status |
| *Constraint* | `UNIQUE` | `uk_batch_student (batch_id, student_id)` | — | Prevents duplicate seat allocation |

### Table 09: `enrollments`
Master academic and fee enrollment contract linking student, course, and batch.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Enrollment ID |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Student user ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE RESTRICT, INDEX` | — | Enrolled course ID |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE RESTRICT, INDEX` | — | Assigned batch ID |
| `enrollment_no` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | — | Unique enrollment number |
| `enrolled_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Enrollment timestamp |
| `status` | `ENUM('ACTIVE','COMPLETED','DROPPED','SUSPENDED')` | `NOT NULL, INDEX` | `'ACTIVE'` | Academic status |
| `completion_percentage` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | Weighted course progress (0-100) |
| `attendance_percentage` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | Cached attendance percentage |
| `total_fee` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Gross course fee at enrollment |
| `discount_amount` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Scholarship/discount applied |
| `paid_amount` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Cumulative amount paid |
| `pending_amount` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Invariant: `total - discount - paid` |
| `completed_at` | `DATETIME` | `NULL` | `NULL` | Completion timestamp |
| *Constraint* | `UNIQUE` | `uk_enrollment_student_batch (student_id, batch_id)` | — | One enrollment per student/batch |

### Table 10: `lectures`
Individual video or live lessons inside a course module.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Lecture ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, INDEX` | — | Parent course |
| `module_id` | `INT UNSIGNED` | `FK -> course_modules(id) ON DELETE CASCADE, INDEX` | — | Parent module |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Lecture title |
| `description` | `TEXT` | `NULL` | `NULL` | Lesson summary/notes |
| `video_url` | `VARCHAR(500)` | `NULL` | `NULL` | Stream/video URL |
| `duration_minutes`| `INT UNSIGNED` | `NOT NULL` | `30` | Duration in minutes |
| `sort_order` | `INT UNSIGNED` | `NOT NULL, INDEX` | `1` | Order within module |
| `is_free_preview` | `BOOLEAN` | `NOT NULL` | `FALSE` | Public preview flag |
| `is_published` | `BOOLEAN` | `NOT NULL, INDEX` | `TRUE` | Visibility flag |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 11: `study_materials`
Downloadable documents and reference links attached to courses/modules/lectures.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Material ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, INDEX` | — | Associated course |
| `lecture_id` | `INT UNSIGNED` | `FK -> lectures(id) ON DELETE CASCADE, NULL, INDEX`| `NULL` | Optional specific lecture |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Document title |
| `file_url` | `VARCHAR(500)` | `NOT NULL` | — | Storage file path / URL |
| `file_type` | `VARCHAR(50)` | `NOT NULL` | `'PDF'` | `PDF`, `PPTX`, `ZIP`, `LINK` |
| `file_size_bytes` | `BIGINT UNSIGNED`| `NOT NULL` | `0` | Size in bytes |
| `uploaded_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Author ID |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Upload timestamp |

### Table 12: `lecture_progress`
Tracks per-student consumption and completion of each lecture.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Progress row ID |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE CASCADE, INDEX` | — | Student ID |
| `lecture_id` | `INT UNSIGNED` | `FK -> lectures(id) ON DELETE CASCADE, INDEX` | — | Lecture ID |
| `is_completed` | `BOOLEAN` | `NOT NULL, INDEX` | `FALSE` | Completion flag |
| `watch_time_seconds` | `INT UNSIGNED` | `NOT NULL` | `0` | Accumulated watch duration |
| `last_position_seconds`| `INT UNSIGNED` | `NOT NULL` | `0` | Resume playback offset |
| `completed_at` | `DATETIME` | `NULL` | `NULL` | Completion timestamp |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Last heartbeat timestamp |
| *Constraint* | `UNIQUE` | `uk_student_lecture (student_id, lecture_id)` | — | Unique progress per student/lecture |

### Table 13: `assignments`
Course/batch assignments authored by instructors.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Assignment ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, INDEX` | — | Target course |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE CASCADE, NULL, INDEX`| `NULL` | Optional batch scope |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Assignment title |
| `description` | `TEXT` | `NOT NULL` | — | Instructions & rubric |
| `due_date` | `DATETIME` | `NOT NULL, INDEX` | — | Submission deadline |
| `max_marks` | `DECIMAL(6,2)` | `NOT NULL` | `100.00` | Maximum score |
| `passing_marks` | `DECIMAL(6,2)` | `NOT NULL` | `40.00` | Minimum passing score |
| `allow_late_submission`| `BOOLEAN` | `NOT NULL` | `TRUE` | Late upload toggle |
| `late_penalty_percent` | `DECIMAL(5,2)` | `NOT NULL` | `10.00` | Deduction % for late uploads |
| `created_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Author instructor/admin |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 14: `submissions`
Student deliverables uploaded for an assignment.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Submission ID |
| `assignment_id` | `INT UNSIGNED` | `FK -> assignments(id) ON DELETE RESTRICT, INDEX` | — | Target assignment |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Submitting student |
| `file_url` | `VARCHAR(500)` | `NULL` | `NULL` | Uploaded artifact path |
| `submission_text` | `TEXT` | `NULL` | `NULL` | Written answer / repository link |
| `submitted_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Upload timestamp |
| `is_late` | `BOOLEAN` | `NOT NULL` | `FALSE` | Flagged if `submitted_at > due_date` |
| `status` | `ENUM('SUBMITTED','GRADED','RESUBMIT_REQUIRED')` | `NOT NULL, INDEX` | `'SUBMITTED'` | Grading workflow state |
| *Constraint* | `UNIQUE` | `uk_assignment_student (assignment_id, student_id)`| — | One active submission record |

### Table 15: `assignment_feedback`
Instructor evaluation and marks for a student submission.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Feedback ID |
| `submission_id` | `INT UNSIGNED` | `FK -> submissions(id) ON DELETE CASCADE, UNIQUE` | — | Evaluated submission |
| `graded_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL, INDEX` | `NULL` | Grader instructor/admin ID |
| `marks_obtained` | `DECIMAL(6,2)` | `NOT NULL` | `0.00` | Awarded score (`<= max_marks`) |
| `feedback_text` | `TEXT` | `NULL` | `NULL` | Qualitative review comments |
| `graded_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Grading timestamp |

### Table 16: `quizzes`
Timed assessment metadata and configuration.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Quiz ID |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, INDEX` | — | Target course |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE CASCADE, NULL, INDEX`| `NULL` | Optional batch scope |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Quiz title |
| `description` | `TEXT` | `NULL` | `NULL` | Assessment instructions |
| `time_limit_minutes` | `INT UNSIGNED` | `NOT NULL` | `30` | Enforced duration in minutes |
| `total_marks` | `DECIMAL(6,2)` | `NOT NULL` | `100.00` | Sum of question marks |
| `passing_percentage` | `DECIMAL(5,2)` | `NOT NULL` | `50.00` | Minimum % required to pass |
| `max_attempts` | `INT UNSIGNED` | `NOT NULL` | `1` | Allowed attempts per student |
| `max_warnings` | `INT UNSIGNED` | `NOT NULL` | `3` | Anti-cheat tab-switch threshold |
| `is_published` | `BOOLEAN` | `NOT NULL, INDEX` | `FALSE` | Visibility state |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |

### Table 17: `questions`
Questions belonging to a quiz.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Question ID |
| `quiz_id` | `INT UNSIGNED` | `FK -> quizzes(id) ON DELETE CASCADE, INDEX` | — | Parent quiz |
| `question_text` | `TEXT` | `NOT NULL` | — | Prompt stem |
| `question_type` | `ENUM('MCQ_SINGLE','MCQ_MULTI','TRUE_FALSE','SHORT_ANSWER')` | `NOT NULL` | `'MCQ_SINGLE'` | Question format |
| `marks` | `DECIMAL(5,2)` | `NOT NULL` | `1.00` | Point weight |
| `explanation` | `TEXT` | `NULL` | `NULL` | Post-attempt solution rationale |
| `sort_order` | `INT UNSIGNED` | `NOT NULL` | `1` | Display sequence |

### Table 18: `quiz_options`
Selectable choices for objective quiz questions.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Option ID |
| `question_id` | `INT UNSIGNED` | `FK -> questions(id) ON DELETE CASCADE, INDEX` | — | Parent question |
| `option_text` | `VARCHAR(500)` | `NOT NULL` | — | Choice label |
| `is_correct` | `BOOLEAN` | `NOT NULL` | `FALSE` | Ground-truth correctness flag |
| `sort_order` | `INT UNSIGNED` | `NOT NULL` | `1` | Option order (`A, B, C, D`) |

### Table 19: `quiz_attempts`
Tracks a student's timed quiz execution session.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Attempt ID |
| `quiz_id` | `INT UNSIGNED` | `FK -> quizzes(id) ON DELETE RESTRICT, INDEX` | — | Target quiz |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Student ID |
| `attempt_number` | `INT UNSIGNED` | `NOT NULL` | `1` | Sequential attempt index |
| `started_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Server start timestamp |
| `expires_at` | `DATETIME` | `NOT NULL, INDEX` | — | `started_at + time_limit_minutes` |
| `submitted_at` | `DATETIME` | `NULL` | `NULL` | Actual submission timestamp |
| `score_obtained` | `DECIMAL(6,2)` | `NOT NULL` | `0.00` | Earned points |
| `percentage` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | Percentage score |
| `is_passed` | `BOOLEAN` | `NOT NULL` | `FALSE` | True if `percentage >= passing_%` |
| `warning_count` | `INT UNSIGNED` | `NOT NULL` | `0` | Accumulated anti-cheat flags |
| `status` | `ENUM('IN_PROGRESS','SUBMITTED','EXPIRED','TERMINATED')` | `NOT NULL, INDEX` | `'IN_PROGRESS'` | Session status |

### Table 20: `quiz_answers`
Individual question responses recorded during a quiz attempt.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Answer row ID |
| `attempt_id` | `INT UNSIGNED` | `FK -> quiz_attempts(id) ON DELETE CASCADE, INDEX`| — | Parent quiz attempt |
| `question_id` | `INT UNSIGNED` | `FK -> questions(id) ON DELETE CASCADE, INDEX` | — | Answered question |
| `selected_option_id`| `INT UNSIGNED`| `FK -> quiz_options(id) ON DELETE SET NULL, NULL` | `NULL` | Chosen option ID |
| `answer_text` | `TEXT` | `NULL` | `NULL` | Free-text response |
| `is_correct` | `BOOLEAN` | `NOT NULL` | `FALSE` | Auto-graded correctness |
| `marks_awarded` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | Points earned |
| *Constraint* | `UNIQUE` | `uk_attempt_question (attempt_id, question_id)` | — | One response per question/attempt |

### Table 21: `quiz_attempt_events`
Anti-cheat proctoring telemetry events logged during a quiz attempt.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Telemetry event ID |
| `attempt_id` | `INT UNSIGNED` | `FK -> quiz_attempts(id) ON DELETE CASCADE, INDEX`| — | Associated attempt |
| `event_type` | `ENUM('TAB_SWITCH','WINDOW_BLUR','FULLSCREEN_EXIT','COPY_PASTE','DEVTOOLS_OPEN')` | `NOT NULL` | — | Violation type |
| `event_metadata` | `JSON` | `NULL` | `NULL` | Browser/client context details |
| `occurred_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Server log timestamp |

### Table 22: `attendance`
Daily batch session attendance register.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Attendance entry ID |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE RESTRICT, INDEX` | — | Target batch |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Student ID |
| `attendance_date` | `DATE` | `NOT NULL, INDEX` | — | Session calendar date |
| `status` | `ENUM('PRESENT','ABSENT','LATE','EXCUSED','HOLIDAY','CANCELLED')` | `NOT NULL, INDEX` | `'PRESENT'` | Attendance status code |
| `marked_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Instructor/admin who marked |
| `remarks` | `VARCHAR(255)` | `NULL` | `NULL` | Leave reason / session note |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Creation timestamp |
| *Constraint* | `UNIQUE` | `uk_batch_student_date (batch_id, student_id, attendance_date)` | — | One mark per student per day |

### Table 23: `certificates`
Issued course completion credentials with public verification codes.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Certificate ID |
| `enrollment_id` | `INT UNSIGNED` | `FK -> enrollments(id) ON DELETE RESTRICT, UNIQUE`| — | Source enrollment record |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Recipient student |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE RESTRICT, INDEX` | — | Completed course |
| `certificate_code` | `VARCHAR(60)` | `NOT NULL, UNIQUE (uk_cert_code)` | — | Human-readable verification code |
| `verification_uuid`| `CHAR(36)` | `NOT NULL, UNIQUE (uk_cert_uuid)` | — | UUIDv4 QR verification token |
| `final_grade` | `VARCHAR(10)` | `NOT NULL` | `'A'` | Computed grade (`A+`, `A`, `B`, `C`) |
| `final_score_pct` | `DECIMAL(5,2)` | `NOT NULL` | `0.00` | Final weighted score % |
| `pdf_url` | `VARCHAR(500)` | `NULL` | `NULL` | Generated PDF file path |
| `status` | `ENUM('ISSUED','REVOKED')` | `NOT NULL, INDEX` | `'ISSUED'` | Credential validity state |
| `issued_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Issuing authority user ID |
| `issued_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Issuance timestamp |
| `revoked_at` | `DATETIME` | `NULL` | `NULL` | Revocation timestamp if revoked |
| `revocation_reason`| `VARCHAR(255)` | `NULL` | `NULL` | Reason for revocation |

### Table 24: `payments`
Fee transactions and installment records against an enrollment.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Payment transaction ID |
| `enrollment_id` | `INT UNSIGNED` | `FK -> enrollments(id) ON DELETE RESTRICT, INDEX` | — | Associated enrollment |
| `student_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE RESTRICT, INDEX` | — | Paying student |
| `amount` | `DECIMAL(10,2)` | `NOT NULL` | — | Installment amount paid (`> 0`) |
| `payment_method` | `ENUM('CASH','CARD','UPI','BANK_TRANSFER','ONLINE_GATEWAY')` | `NOT NULL` | `'UPI'` | Payment channel |
| `transaction_ref` | `VARCHAR(120)` | `NULL, INDEX` | `NULL` | External UTR / gateway ref |
| `status` | `ENUM('SUCCESS','PENDING','FAILED','REFUNDED')` | `NOT NULL, INDEX` | `'SUCCESS'` | Settlement status |
| `payment_date` | `DATETIME` | `NOT NULL, INDEX` | `CURRENT_TIMESTAMP` | Date of payment |
| `recorded_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Admin who recorded payment |
| `remarks` | `VARCHAR(255)` | `NULL` | `NULL` | Installment notes |

### Table 25: `payment_receipts`
Immutable official payment receipt vouchers generated for successful payments.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Receipt ID |
| `payment_id` | `INT UNSIGNED` | `FK -> payments(id) ON DELETE RESTRICT, UNIQUE` | — | Parent payment transaction |
| `receipt_number` | `VARCHAR(60)` | `NOT NULL, UNIQUE` | — | Sequential receipt voucher no |
| `balance_after` | `DECIMAL(10,2)` | `NOT NULL` | `0.00` | Remaining pending fee after tx |
| `pdf_url` | `VARCHAR(500)` | `NULL` | `NULL` | Downloadable receipt PDF path |
| `issued_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Receipt generation timestamp |

### Table 26: `notifications`
Per-user in-app alert and notification inbox.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Notification ID |
| `user_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE CASCADE, INDEX` | — | Recipient user |
| `title` | `VARCHAR(180)` | `NOT NULL` | — | Short notification headline |
| `message` | `TEXT` | `NOT NULL` | — | Detailed notification body |
| `notification_type`| `ENUM('SYSTEM','ASSIGNMENT','QUIZ','ATTENDANCE','PAYMENT','CERTIFICATE','ANNOUNCEMENT')` | `NOT NULL` | `'SYSTEM'` | Category badge |
| `is_read` | `BOOLEAN` | `NOT NULL, INDEX` | `FALSE` | Read/unread flag |
| `link_url` | `VARCHAR(300)` | `NULL` | `NULL` | Deep-link route in frontend |
| `created_at` | `DATETIME` | `NOT NULL, INDEX` | `CURRENT_TIMESTAMP` | Dispatch timestamp |

### Table 27: `announcements`
Targeted or global broadcast notices published by Admins or Instructors.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Announcement ID |
| `title` | `VARCHAR(200)` | `NOT NULL` | — | Broadcast headline |
| `content` | `TEXT` | `NOT NULL` | — | Rich announcement body |
| `target_role` | `ENUM('ALL','ADMIN','INSTRUCTOR','STUDENT')` | `NOT NULL, INDEX` | `'ALL'` | Audience role filter |
| `course_id` | `INT UNSIGNED` | `FK -> courses(id) ON DELETE CASCADE, NULL, INDEX`| `NULL` | Optional course filter |
| `batch_id` | `INT UNSIGNED` | `FK -> batches(id) ON DELETE CASCADE, NULL, INDEX`| `NULL` | Optional batch filter |
| `priority` | `ENUM('LOW','NORMAL','HIGH','URGENT')` | `NOT NULL` | `'NORMAL'` | Visual urgency level |
| `published_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Author ID |
| `expires_at` | `DATETIME` | `NULL` | `NULL` | Optional auto-hide timestamp |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Publication timestamp |

### Table 28: `refresh_tokens`
Database-backed JWT refresh token registry supporting rotation and immediate revocation.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Token record ID |
| `user_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE CASCADE, INDEX` | — | Token owner |
| `token_hash` | `VARCHAR(128)` | `NOT NULL, UNIQUE (uk_refresh_token_hash)` | — | SHA-256 hash of refresh token |
| `jti` | `CHAR(36)` | `NOT NULL, UNIQUE` | — | Unique JWT ID claim |
| `is_revoked` | `BOOLEAN` | `NOT NULL, INDEX` | `FALSE` | Revocation status flag |
| `replaced_by_jti` | `CHAR(36)` | `NULL` | `NULL` | Successor JTI on token rotation |
| `user_agent` | `VARCHAR(255)` | `NULL` | `NULL` | Client device/browser signature |
| `ip_address` | `VARCHAR(45)` | `NULL` | `NULL` | Client IPv4/IPv6 address |
| `expires_at` | `DATETIME` | `NOT NULL, INDEX` | — | Token expiration timestamp |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Issuance timestamp |

### Table 29: `password_reset_tokens`
Single-use, time-limited tokens for self-service password recovery.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Reset token ID |
| `user_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE CASCADE, INDEX` | — | Target user account |
| `token_hash` | `VARCHAR(128)` | `NOT NULL, UNIQUE` | — | SHA-256 hash of reset token |
| `is_used` | `BOOLEAN` | `NOT NULL` | `FALSE` | Consumed status flag |
| `expires_at` | `DATETIME` | `NOT NULL, INDEX` | — | Expiration (default +30 mins) |
| `created_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Request timestamp |

### Table 30: `audit_logs`
Immutable security and compliance ledger tracking state-changing operations.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `BIGINT UNSIGNED`| `PK, AUTO_INCREMENT` | — | Audit log sequence ID |
| `actor_id` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL, NULL, INDEX` | `NULL` | User who performed action |
| `action` | `VARCHAR(100)` | `NOT NULL, INDEX` | — | Event code (`PAYMENT_CREATED`) |
| `entity_type` | `VARCHAR(80)` | `NOT NULL, INDEX` | — | Table/resource (`enrollments`) |
| `entity_id` | `VARCHAR(64)` | `NULL, INDEX` | `NULL` | Primary key of affected row |
| `old_values` | `JSON` | `NULL` | `NULL` | Pre-mutation snapshot |
| `new_values` | `JSON` | `NULL` | `NULL` | Post-mutation snapshot |
| `ip_address` | `VARCHAR(45)` | `NULL` | `NULL` | Originating client IP |
| `created_at` | `DATETIME` | `NOT NULL, INDEX` | `CURRENT_TIMESTAMP` | Event timestamp |

### Table 31: `system_settings`
Dynamic institutional configuration parameters managed by Administrators.
| Column | Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `INT UNSIGNED` | `PK, AUTO_INCREMENT` | — | Setting ID |
| `setting_key` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | — | Key (`MIN_ATTENDANCE_PCT`) |
| `setting_value` | `TEXT` | `NOT NULL` | — | Serialized value (`75.0`) |
| `value_type` | `ENUM('STRING','INT','FLOAT','BOOL','JSON')` | `NOT NULL` | `'STRING'` | Type coercion hint |
| `description` | `VARCHAR(255)` | `NULL` | `NULL` | Admin UI description |
| `updated_by` | `INT UNSIGNED` | `FK -> users(id) ON DELETE SET NULL` | `NULL` | Last editor user ID |
| `updated_at` | `DATETIME` | `NOT NULL` | `CURRENT_TIMESTAMP` | Last modification time |
