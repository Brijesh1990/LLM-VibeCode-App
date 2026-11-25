# Module 10: Attendance Ledger & Holiday-Aware Formula
**Module Prompt Reference:** `NEXUS-PRM-MOD-10`  
**Target Routes:** `/api/v1/attendance/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Construct the Daily Attendance Register and Holiday-Aware Attendance Engine for NexusLMS.

Requirements:
1. Formula Specification:
   Attendance % = (Present Classes / Total Eligible Classes) * 100
2. Invariants:
   - Holiday / Cancelled Exclusions: Any session where `session_status IN ('holiday', 'cancelled')` is excluded from Total Eligible Classes.
   - Excused Leave: Any student record where `status = 'approved_leave'` is omitted from the penalty denominator.
   - Present Classes: Sum of `present` and `late` sessions.
3. Endpoints:
   - GET /api/v1/attendance: Scoped attendance records with stats summary.
   - POST /api/v1/attendance/bulk: Bulk attendance marking for a batch session.
   - GET /api/v1/attendance/summary: Breakdown of total sessions, present, absent, approved leave, and final attendance percentage.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/attendance.py` and `calculate_attendance_stats` in `lms_service.py`.
* **Testing:** Attendance records correctly exclude holidays and approved leaves from student penalties.
