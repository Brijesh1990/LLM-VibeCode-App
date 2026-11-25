# Module 08: Assignments, Submissions & Rubric Evaluations
**Module Prompt Reference:** `NEXUS-PRM-MOD-08`  
**Target Routes:** `/api/v1/assignments/*`, `/api/v1/submissions/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Build the Capstone Assignment and Rubric Evaluation module for NexusLMS.

Requirements:
1. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/assignments: Author assignments with deadline, max_marks, passing_marks, and late submission penalties.
   - POST /api/v1/submissions/{id}/upload: Student submission dropzone accepting source code archives or report PDFs before deadline.
   - GET /api/v1/submissions: Scoped list of submissions for review.
   - POST /api/v1/submissions/{id}/evaluate: Instructor grading with score, rubric checklist feedback, and student notification.
2. Invariants:
   - Late Enforcement: Submissions timestamped after deadline marked `is_late = True`.
   - Score Validation: `score <= max_marks`.
   - Score Contributes to Course Completion: Passing assignments (score >= passing_marks) trigger progress recalculation (30% weight).
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/assignments.py` and `submissions.py`.
* **Testing:** Verified assignment submission file handling and rubric evaluation feedback workflow.
