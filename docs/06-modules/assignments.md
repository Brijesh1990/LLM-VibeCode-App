# Module Specification: Assignments, Submissions & Grading (`assignments.md`)

**Module Route Prefix:** `/api/v1/assignments`, `/api/v1/submissions`  
**Database Tables:** `assignments`, `submissions`, `assignment_feedback`  

---

## 1. Module Responsibilities
1. Allow Instructors and Admins to publish course or batch-specific practical assignments with deadlines (`due_date`), scoring rubrics (`max_marks`, `passing_marks`), and late submission penalties.
2. Enable enrolled students to upload assignment files or text/link responses (`submissions`).
3. Provide instructors with a structured grading workflow (`assignment_feedback`) that automatically updates the `30%` Assignment component of course completion.

---

## 2. Late Submission & Penalty Rules
- **Deadline Check:** When a student calls `POST /api/v1/submissions`:
  - If `UTC_NOW() <= assignment.due_date`, `is_late` is set to `False`.
  - If `UTC_NOW() > assignment.due_date`:
    - If `assignment.allow_late_submission == False`, the server rejects the upload with HTTP `422 DEADLINE_PASSED`.
    - If `assignment.allow_late_submission == True`, the submission is accepted with `is_late = True`.
- **Penalty Calculation during Grading (`POST /api/v1/submissions/{id}/grade`):**
  - If `submission.is_late == True` and `assignment.late_penalty_percent > 0`, the recommended or enforced penalty deduction is applied:
    $$\text{Effective Marks} = \max\left(0, \text{Raw Marks} \times \left(1 - \frac{\text{late\_penalty\_percent}}{100}\right)\right)$$
- **Resubmission Workflow:** Instructors can set status to `RESUBMIT_REQUIRED` with feedback notes, allowing the student to upload a revised artifact.
