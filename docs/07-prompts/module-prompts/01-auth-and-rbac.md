# Module 01: Authentication, Authorization & RBAC
**Module Prompt Reference:** `NEXUS-PRM-MOD-01`  
**Target Routes:** `/api/v1/auth/*`  
**Security Status:** Sanitized — Mock Tokens / Env Variables Only  

---

### Prompt Specification
```markdown
Implement the complete enterprise Authentication and Role-Based Access Control (RBAC) subsystem for NexusLMS using FastAPI, SQLAlchemy 2.x, and MySQL 8.

Requirements:
1. Endpoints:
   - POST /api/v1/auth/login: Authenticate email/password via Argon2/bcrypt; return access_token (60m) and refresh_token (7d).
   - POST /api/v1/auth/register: Self-service student registration with unique email validation and role assignment.
   - POST /api/v1/auth/refresh: Single-use refresh token rotation with database-persisted revocation check.
   - POST /api/v1/auth/logout: Revoke active refresh token in MySQL.
   - GET /api/v1/auth/me: Retrieve current authenticated user profile with role permissions.
   - PUT /api/v1/auth/profile: Update name, phone, bio, and avatar.
   - PUT /api/v1/auth/change-password: Verify old password before hashing new password.
   - POST /api/v1/auth/forgot-password & reset-password: Tokenized self-service password reset.
2. Security Safeguards:
   - Stateless JWT signed with HS256 using SECRET_KEY from environment.
   - Passwords hashed using passlib/bcrypt with work factor >= 12.
   - Dependencies: get_current_user, require_admin, require_instructor, require_student.
   - Reject inactive or soft-deleted accounts immediately with 403 Forbidden.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/auth.py` and `backend/app/dependencies/auth.py`.
* **Testing:** Verified via `test_all_modules.py` with 100% login success across `admin@lms.com`, `instructor@lms.com`, and `student@lms.com`.
