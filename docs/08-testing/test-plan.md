# Comprehensive Test Plan & Quality Assurance Strategy (`test-plan.md`)

**Document Version:** 1.0.0  
**Project:** Enterprise LMS  
**Test Frameworks:** `pytest` + `httpx` / `TestClient` (Backend) | TypeScript Compiler + Vite Build + E2E Role Flows (Frontend)  

---

## 1. Testing Objectives & Scope
The test suite validates functional correctness, security enforcement, relational integrity across all 31 tables, and deterministic business formulas across all 22 API modules and 3 user roles (`ADMIN`, `INSTRUCTOR`, `STUDENT`) plus `PUBLIC` verification.

---

## 2. Test Levels & Coverage Matrix

| Test Category | Scope | Target Modules | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **1. Authentication & Token Security** | Login, Refresh Rotation, Replay Detection, Logout, Password Reset, Inactive User Block | `/api/v1/auth`, `/api/v1/users` | Valid tokens issued; revoked refresh token returns `401`; deactivated user blocked immediately. |
| **2. RBAC & Resource Ownership** | Cross-role & cross-resource access attempts | All 22 routers | Student cannot access Admin/Instructor mutations (`403`); Instructor A cannot modify Instructor B's batch (`403`). |
| **3. Batch Capacity & Enrollment** | Seat reservation, duplicate prevention, full-batch rejection | `/api/v1/batches`, `/api/v1/enrollments` | `current_strength` increments atomically; enrollment beyond `max_capacity` returns `409 Conflict`. |
| **4. Attendance Formula Engine** | `PRESENT`, `LATE`, `ABSENT`, `HOLIDAY`, `CANCELLED`, `EXCUSED` combinations | `/api/v1/attendance` | `HOLIDAY`, `CANCELLED`, `EXCUSED` excluded from denominator; exact percentage matches formula to 2 decimal places. |
| **5. Course Completion Engine** | `50% Lectures + 30% Assignments + 20% Quizzes` & dynamic weight re-normalization | `/api/v1/progress`, `/api/v1/submissions`, `/api/v1/quizzes` | Completion % updates automatically after lecture completion, assignment grading, and quiz submission. |
| **6. Timed Quiz & Anti-Cheat** | Server timer expiry, 30s grace window, warning counter auto-termination | `/api/v1/quizzes` | Submissions after `expires_at + 30s` marked `EXPIRED`; exceeding `max_warnings` transitions attempt to `TERMINATED`. |
| **7. Fee Invariant & Receipts** | Installment payments, overpayment block, receipt voucher creation | `/api/v1/payments` | `Paid + Pending == Total - Discount` holds on every transaction; payment `> pending_amount` rejected with `422`. |
| **8. Certificate Eligibility & Verify**| 4-gate eligibility check, issuance, public verification, revocation | `/api/v1/certificates` | Ineligible student blocked (`422`); issued certificate verifiable publicly; revoked certificate shows `REVOKED` status. |

---

## 3. Test Execution Commands

### Backend Automated Test Suite
```powershell
cd d:\LLM-VibeCoding\backend
pytest -v --tb=short
```

### Frontend Type-Check & Production Bundle Verification
```powershell
cd d:\LLM-VibeCoding\frontend
npm run build
```
