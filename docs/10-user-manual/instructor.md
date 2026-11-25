# Instructor User Manual (`instructor.md`)

**Document Version:** 1.0.0  
**Target Role:** Faculty / Instructor (`INSTRUCTOR`)  
**Default Demo Login:** `instructor@lms.edu` / `Instructor@123`  

---

## 1. Instructor Workspace Overview
Upon signing in, you are directed to the **Instructor Studio** (`/instructor/dashboard`), which summarizes:
- Your assigned ongoing and upcoming batches.
- Total active students under your instruction.
- Pending assignment submissions awaiting grading.
- At-risk students whose attendance has fallen below `75%`.

> **Scope Note:** As an Instructor, you have full academic authoring and grading authority over the courses and batches explicitly assigned to you.

---

## 2. Building Course Modules, Lectures & Study Materials
1. Navigate to **My Courses** (`/instructor/courses`) and select an assigned course.
2. **Add Module:** Click **+ Add Module** to create an ordered syllabus unit (e.g., *Module 1: Modern React 19 Architecture*).
3. **Add Lecture:** Inside any module, click **+ Add Lecture**, provide the title, video stream URL, duration in minutes, sort order, and toggle whether it is a free preview.
4. **Attach Study Materials:** Click **+ Attach Material** to upload supplementary PDFs, slide decks (`.pptx`), or code archives (`.zip` up to 50 MB).

---

## 3. Marking Daily Batch Attendance
1. Open **Mark Attendance** (`/instructor/attendance`).
2. Select your **Batch** (`FSWD-2026A`) and the **Session Date**.
3. Mark each student's status:
   - `PRESENT` or `LATE` (counts as attended).
   - `ABSENT` (counts against attendance percentage).
   - `EXCUSED` (approved medical/personal leave — excluded from the denominator so the student is not penalized).
4. If no class was held due to an institutional holiday or cancellation, use **Mark Day as Holiday / Cancelled** — these sessions are automatically excluded from all students' attendance denominators.
5. Click **Save Attendance Register**. Cumulative attendance percentages update in real time.

---

## 4. Creating Assignments & Grading Submissions
1. Go to **Assignments** (`/instructor/assignments`) -> click **+ New Assignment**.
2. Set the title, rubric instructions, `due_date`, `max_marks`, `passing_marks`, and late submission policy (`allow_late_submission` & `late_penalty_percent`).
3. To grade student work, open **Grading Queue** (`/instructor/submissions`):
   - Inspect the student's uploaded file or text submission and check the on-time/late badge.
   - Enter `marks_obtained` and detailed qualitative feedback.
   - Click **Save Grade**. The student is notified immediately and their `30%` Assignment completion weight is recalculated.

---

## 5. Authoring Timed Quizzes & Reviewing Anti-Cheat Logs
1. Open **Quizzes & Question Banks** (`/instructor/quizzes`) -> click **+ Create Quiz**.
2. Configure `time_limit_minutes` (e.g., `30 mins`), `passing_percentage`, `max_attempts`, and `max_warnings` (default `3` anti-cheat violations).
3. Add Single-Choice, Multi-Choice, True/False, or Short-Answer questions with point weights and correct options.
4. In the **Quiz Attempts** tab, inspect student scores alongside any flagged anti-cheat telemetry (`TAB_SWITCH`, `FULLSCREEN_EXIT`, `COPY_PASTE`).

---

## 6. Publishing Batch Announcements
Open **Announcements** (`/instructor/announcements`) to post priority notices (`NORMAL`, `HIGH`, `URGENT`) scoped specifically to your batch or course students.
