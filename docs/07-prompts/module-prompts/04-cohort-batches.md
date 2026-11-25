# Module 04: Cohort Batches & Capacity Management
**Module Prompt Reference:** `NEXUS-PRM-MOD-04`  
**Target Routes:** `/api/v1/batches/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Implement the Cohort Batch Scheduling and Capacity Enforcement module for NexusLMS.

Requirements:
1. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/batches: Manage training cohorts with start_date, end_date, max_capacity, class_days, class_timing, and assigned instructor.
   - GET /api/v1/batches/{id}/students: Fetch student roster assigned to cohort.
   - POST /api/v1/batches/{id}/assign-student: Add student to cohort with capacity validation.
2. Invariants:
   - Capacity Lock: Prevent student assignment or enrollment if `current_strength >= max_capacity`.
   - Date Validation: Ensure `end_date >= start_date`.
   - Instructor Tenancy: Faculty can only access batches assigned to their instructor ID.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/batches.py`.
* **Testing:** Verified 3 active batches (`Batch Alpha`, `Batch Beta`, `Batch Gamma`) with available seat calculations.
