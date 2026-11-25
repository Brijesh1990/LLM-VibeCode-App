# Module 11: Real-Time Student Course Progress Tracking
**Module Prompt Reference:** `NEXUS-PRM-MOD-11`  
**Target Routes:** `/api/v1/progress/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Develop the Real-Time Course Progress Engine for NexusLMS using the authoritative weighted curriculum formula.

Requirements:
1. Completion Formula:
   Completion % = 0.50 * (Completed Lectures / Total Lectures)
                + 0.30 * (Submitted & Passing Assignments / Total Assignments)
                + 0.20 * (Attempted & Passing Quizzes / Total Quizzes)
2. Dynamic Re-Normalization:
   If a course contains no quizzes or no assignments yet, normalize weights proportionally across available components so progress accurately reaches 100%.
3. Endpoints:
   - GET /api/v1/progress: Scoped student progress records with individual component metrics.
   - GET /api/v1/progress/{student_id}/{course_id}: Full academic progress transcript.
4. Auto-Completion Trigger:
   When `completion_percentage >= course.completion_threshold_pct` (default 75%), automatically set `enrollments.status = 'completed'` and unlock certificate issuance.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/progress.py` and `recalculate_student_course_progress` in `lms_service.py`.
* **Testing:** Verified dynamic progress updates upon lecture completion and assignment grading.
