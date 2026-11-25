# Enterprise LMS — Business Rules, Formulas & Operational Policies

**Document Version:** 1.0.0  
**Enforcement Layer:** Backend Domain Service Layer (`app/services/*`) + Database Constraints  

---

## 1. Attendance Percentage Policy & Formula

### 1.1 Mathematical Formula
For any student enrolled in a batch, the cumulative **Attendance Percentage** is computed over all conducted, eligible sessions:

$$\text{Attendance Percentage} = \left( \frac{\text{Present Classes}}{\text{Total Eligible Classes}} \right) \times 100$$

Where:
- **$\text{Present Classes}$:** Count of attendance records for the student in that batch where:
  - `status = 'PRESENT'`, OR
  - `status = 'LATE'` (counted as present with a tardiness flag; configurable to `0.5` weight via `system_settings.LATE_ATTENDANCE_WEIGHT`, defaulting to `1.0`).
- **$\text{Total Eligible Classes}$:** Total recorded batch sessions **excluding** non-instructional or excused days:
  $$\text{Total Eligible Classes} = N_{\text{PRESENT}} + N_{\text{LATE}} + N_{\text{ABSENT}}$$

### 1.2 Handling of Holidays, Cancelled Classes & Approved Leave
| Attendance Status Code | Counts in Numerator ($\text{Present}$)? | Counts in Denominator ($\text{Total Eligible}$)? | Policy Rationale |
| :--- | :---: | :---: | :--- |
| `PRESENT` | **Yes (+1.0)** | **Yes (+1.0)** | Student attended regular session. |
| `LATE` | **Yes (+1.0)** | **Yes (+1.0)** | Student attended after grace window. |
| `ABSENT` | **No (0.0)** | **Yes (+1.0)** | Unexcused absence reduces attendance percentage. |
| `HOLIDAY` | **Excluded** | **Excluded** | Official public/institutional holiday; no penalty to students. |
| `CANCELLED` | **Excluded** | **Excluded** | Session cancelled by instructor/admin; excluded from denominator. |
| `EXCUSED` | **Excluded** | **Excluded** | Approved medical/emergency leave verified by Instructor/Admin; neutral impact. |

> **Edge Case Rule:** If $\text{Total Eligible Classes} == 0$ (newly started batch with no eligible sessions yet), $\text{Attendance Percentage}$ defaults to `100.00%` (or `0.00%` display with `"No sessions conducted"` badge) and does not trigger low-attendance warnings until at least 3 eligible sessions are recorded.

---

## 2. Course Completion Percentage Formula

### 2.1 Weighted Multi-Component Formula
Course completion is a composite metric balancing content consumption, practical assignments, and timed assessments:

$$\text{Course Completion \%} = (0.50 \times L_{\%}) + (0.30 \times A_{\%}) + (0.20 \times Q_{\%})$$

Where:
1. **Lecture Progress ($L_{\%}$, Weight = 50%):**
   $$L_{\%} = \left( \frac{\text{Completed Published Lectures in Course}}{\text{Total Published Lectures in Course}} \right) \times 100$$
2. **Assignment Completion ($A_{\%}$, Weight = 30%):**
   $$A_{\%} = \left( \frac{\text{Submitted \& Passed Assignments}}{\text{Total Published Assignments for Course/Batch}} \right) \times 100$$
3. **Quiz Completion ($Q_{\%}$, Weight = 20%):**
   $$Q_{\%} = \left( \frac{\text{Quizzes with at least one Passing Attempt}}{\text{Total Published Quizzes for Course/Batch}} \right) \times 100$$

### 2.2 Dynamic Weight Re-Normalization (Configurable Fallback)
- Weights are stored in `system_settings` (`WEIGHT_LECTURES = 50`, `WEIGHT_ASSIGNMENTS = 30`, `WEIGHT_QUIZZES = 20`).
- **Zero-Component Re-balancing:** If a course has `0` published quizzes or `0` published assignments, its active component weights are proportionally normalized so the maximum achievable score remains `100.00%`. For example, if a course has only lectures and assignments ($50 : 30$), effective weights become $62.5\%$ and $37.5\%$.

---

## 3. Certificate Eligibility & Revocation Rules

A student is eligible for automated or admin-triggered certificate issuance (`POST /api/v1/certificates/issue`) **if and only if all four gates pass**:

1. **Gate 1 — Academic Completion Threshold:**
   $$\text{enrollments.completion\_percentage} \ge 80.00\%$$
2. **Gate 2 — Minimum Attendance Threshold:**
   $$\text{enrollments.attendance\_percentage} \ge 75.00\%$$
3. **Gate 3 — Assessment Competence:**
   - All mandatory course assignments are `GRADED` with `marks_obtained >= passing_marks`.
   - All mandatory quizzes have `is_passed = TRUE`.
4. **Gate 4 — Financial Clearance (No Pending Dues):**
   $$\text{enrollments.pending\_amount} == 0.00$$

### 3.1 Final Grade Mapping
| Weighted Assessment Score % | Awarded Grade | Distinction Label |
| :--- | :---: | :--- |
| `90.00% – 100.00%` | `A+` | With High Distinction |
| `80.00% – 89.99%` | `A` | First Class |
| `70.00% – 79.99%` | `B` | Second Class |
| `60.00% – 69.99%` | `C` | Pass |

### 3.2 Certificate Revocation Policy
- Only an `ADMIN` can revoke an issued certificate (`POST /api/v1/certificates/{id}/revoke`) by supplying a mandatory `revocation_reason`.
- Revoked certificates remain in the `certificates` table with `status = 'REVOKED'` so the public verification endpoint (`/api/v1/certificates/verify/{code}`) explicitly displays a red **REVOKED CREDENTIAL** alert rather than a generic 404.

---

## 4. Timed Quiz Server-Side Enforcement & Anti-Cheat Rules

1. **Authoritative Server Clock:**
   - When a student calls `POST /api/v1/quizzes/{id}/start`, the server records `started_at = UTC_NOW()` and `expires_at = UTC_NOW() + INTERVAL time_limit_minutes MINUTE`.
   - Client countdown timers are purely visual projections of `expires_at - server_now`.
2. **Network Grace Window:**
   - Submissions arriving at `POST /api/v1/quizzes/attempts/{attempt_id}/submit` up to `expires_at + 30 seconds` are accepted to account for network transit latency.
   - Submissions arriving after `expires_at + 30 seconds` are rejected or auto-finalized using only answers saved prior to `expires_at`, marking status as `EXPIRED`.
3. **Attempt Ceiling:**
   - A student cannot start a new attempt if `COUNT(attempts) >= quizzes.max_attempts` or if an existing attempt is currently `IN_PROGRESS`.
4. **Anti-Cheat Proctoring Telemetry:**
   - Client listeners detect `visibilitychange` (`TAB_SWITCH`), `blur` (`WINDOW_BLUR`), `fullscreenchange` (`FULLSCREEN_EXIT`), and clipboard interception (`COPY_PASTE`).
   - Each violation posts to `/api/v1/quizzes/attempts/{attempt_id}/events` and increments `quiz_attempts.warning_count`.
   - When `warning_count > quizzes.max_warnings` (default `3`), the server automatically transitions the attempt to `status = 'TERMINATED'`, locks further answer mutations, grades existing answers, and logs an audit event.

---

## 5. Batch Capacity Enforcement Policy

1. **Atomic Seat Reservation:**
   - Every batch defines `max_capacity` (e.g., `30`) and tracks `current_strength`.
   - During `POST /api/v1/enrollments`, the service locks the batch row (`SELECT ... FOR UPDATE`) and checks:
     $$\text{current\_strength} < \text{max\_capacity}$$
   - If `current_strength >= max_capacity`, enrollment is rejected with HTTP `409 Conflict` (`BATCH_CAPACITY_FULL`).
2. **Seat Release on Drop/Transfer:**
   - Transitioning an enrollment status from `ACTIVE` to `DROPPED` or transferring a student to another batch decrements `current_strength` by `1` (floored at `0`).

---

## 6. Fee Calculation & Financial Invariant Rules

### 6.1 Fundamental Accounting Invariant
At every point in an enrollment's lifecycle, the following equation MUST hold true:

$$\text{Net Payable Fee} = \text{Total Fee} - \text{Discount Amount}$$
$$\text{Paid Amount} + \text{Pending Amount} = \text{Net Payable Fee}$$

Equivalently (when $\text{Net Total Fee}$ denotes net payable tuition):
$$\text{Paid} + \text{Pending} = \text{Total Fee}$$

### 6.2 Installment & Receipt Rules
- **No Overpayment:** Any payment request where `payment.amount > enrollment.pending_amount` is rejected with HTTP `422 Unprocessable Entity`.
- **Positive Amounts Only:** `payment.amount` must be strictly `> 0.00`.
- **Automatic Receipt Voucher:** Every payment with `status = 'SUCCESS'` atomically increments `enrollments.paid_amount`, decrements `enrollments.pending_amount`, and inserts an immutable row in `payment_receipts` with `balance_after = enrollments.pending_amount`.

---

## 7. Safe Deletion & Archival Rules

| Entity | Hard Delete Allowed? | Enforced Deletion Behavior |
| :--- | :---: | :--- |
| `users` (`ADMIN`, `INSTRUCTOR`, `STUDENT`) | **No** | Soft-deactivated via `is_active = FALSE`; all refresh tokens revoked immediately. |
| `courses` | **Conditional** | Hard delete permitted only in `DRAFT` status with `0` batches/enrollments; otherwise archived (`status = 'ARCHIVED'`). |
| `batches` | **Conditional** | Hard delete permitted only if `current_strength == 0` and `0` attendance records exist; otherwise `status = 'CANCELLED'`. |
| `payments` & `payment_receipts` | **Never** | Immutable financial ledger; corrections require a compensating `REFUNDED` entry and `audit_logs` record. |
| `certificates` | **Never** | Immutable credential ledger; invalidated only via `status = 'REVOKED'`. |
| `audit_logs` | **Never** | Append-only compliance table; no `UPDATE` or `DELETE` endpoints exist. |
