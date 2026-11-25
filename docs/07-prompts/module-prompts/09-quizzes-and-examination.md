# Module 09: Timed Online Quizzes & Anti-Cheat Examination Engine
**Module Prompt Reference:** `NEXUS-PRM-MOD-09`  
**Target Routes:** `/api/v1/quizzes/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Implement the Server-Graded Timed MCQ Examination and Anti-Cheat Engine for NexusLMS.

Requirements:
1. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/quizzes: Quiz configuration with duration_minutes, passing_score, and max_warnings.
   - GET /api/v1/quizzes/{id}/questions: Question bank with multiple-choice options.
   - POST /api/v1/quizzes/{id}/start: Records server-authoritative started_at and computes expires_at (+30s network grace).
   - POST /api/v1/quizzes/{attempt_id}/event: Logs anti-cheat telemetry (tab-switch, fullscreen exit) and terminates attempt when warning_count > max_warnings.
   - POST /api/v1/quizzes/{attempt_id}/submit: Server-grades answers against quiz_options.is_correct in MySQL, marks score, and records pass/fail.
2. Tamper Resistance:
   - Strip `is_correct` flags from all student-facing API responses.
   - Reject submissions sent after `expires_at + 30s grace` with 400 Bad Request.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/quizzes.py`.
* **Testing:** Verified server-side quiz timing, anti-cheat event logging, and automated score computation.
