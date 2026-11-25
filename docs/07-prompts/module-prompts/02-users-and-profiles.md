# Module 02: Users, Students & Instructors Management
**Module Prompt Reference:** `NEXUS-PRM-MOD-02`  
**Target Routes:** `/api/v1/users`, `/api/v1/students`, `/api/v1/instructors`  
**Security Status:** Sanitized — Mock Identifiers Only  

---

### Prompt Specification
```markdown
Develop the full CRUD user management and faculty/student profile administration for NexusLMS.

Requirements:
1. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/users (Admin only) with pagination, search, role filters, and soft deletion (`is_deleted = True`).
   - GET, POST, PUT /api/v1/students: Manage student profiles with registration numbers (`STU-0001`), enrolled batches, and guardians.
   - GET, POST, PUT /api/v1/instructors: Manage faculty profiles with specialization, bio, qualification, and assigned courses.
2. Safeguards:
   - Cascade and protect relational integrity: never delete users who have financial payment records or active course grades.
   - Audit all administrative role modifications in `audit_logs`.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/users.py`, `students.py`, and `instructors.py`.
* **Testing:** Admin can view all 11 seed users and filter by student/instructor roles seamlessly.
