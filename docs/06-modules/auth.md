# Module Specification: Authentication & Identity (`auth.md`)

**Module Route Prefix:** `/api/v1/auth`, `/api/v1/users`  
**Database Tables:** `roles`, `users`, `instructors`, `refresh_tokens`, `password_reset_tokens`, `audit_logs`  

---

## 1. Module Responsibilities
1. Authenticate users (`ADMIN`, `INSTRUCTOR`, `STUDENT`) via email and password.
2. Issue short-lived stateless JWT Access Tokens (30 minutes) and database-tracked rotating Refresh Tokens (7 days).
3. Enforce token revocation on logout and detect refresh token replay/theft.
4. Provide secure self-service password recovery via single-use SHA-256 hashed tokens.
5. Enforce account active status (`users.is_active == True`) at login and on every protected request.

---

## 2. Database & State Machine Flow
1. **Login (`POST /api/v1/auth/login`):**
   - Lookup user by `email` (case-insensitive index).
   - Verify password against `users.password_hash` using bcrypt/Argon2.
   - Check `user.is_active == True`; reject with `403 ACCOUNT_DISABLED` if false.
   - Generate Access Token (`sub`, `role`, `email`, `exp`) and Refresh Token (`sub`, `jti`, `exp`).
   - Persist `SHA256(refresh_token)` in `refresh_tokens` with `user_agent` and `ip_address`.
   - Update `users.last_login_at = UTC_NOW()`.
2. **Token Rotation (`POST /api/v1/auth/refresh`):**
   - Hash incoming refresh token and query `refresh_tokens`.
   - If `is_revoked == True`, revoke all active tokens for `user_id` (compromise protection) and return `401`.
   - Otherwise, set `is_revoked = True`, `replaced_by_jti = new_jti`, insert new token row, and return fresh token pair.
3. **Logout (`POST /api/v1/auth/logout`):**
   - Mark the current `refresh_tokens` record `is_revoked = True`.

---

## 3. Validation & Security Edge Cases
- **Enumeration Protection:** `POST /api/v1/auth/forgot-password` always returns `200 OK` with a generic confirmation message regardless of whether the email exists in `users`.
- **Immediate Deactivation Enforcement:** When an Admin sets `users.is_active = False`, all active rows in `refresh_tokens` for that user are immediately marked `is_revoked = True`.
