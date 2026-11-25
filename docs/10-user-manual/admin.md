# Administrator User Manual (`admin.md`)

**Document Version:** 1.0.0  
**Target Role:** System Administrator (`ADMIN`)  
**Default Demo Login:** `admin@lms.edu` / `Admin@123`  

---

## 1. Logging In & Navigating the Admin Console
1. Open the Enterprise LMS portal (`http://localhost:5173/login`) and sign in with your Administrator credentials.
2. You will land on the **Executive Dashboard** (`/admin/dashboard`), which displays:
   - Total active students, active batches, monthly revenue collected, and pending fee receivables.
   - 12-month enrollment and revenue charts.
   - Batch capacity occupancy gauges and the live system audit trail.

---

## 2. Managing Users, Instructors & Students
1. Navigate to **Users & Roles** (`/admin/users`).
2. Click **+ Create User** to onboard a new `ADMIN`, `INSTRUCTOR`, or `STUDENT`.
3. For faculty members, open **Instructors** (`/admin/instructors`) to configure their employee code, domain specialization, academic qualification, and years of experience.
4. **Deactivating an Account:** Toggle a user's status to **Inactive** (`is_active = False`). Note that historical records are never hard-deleted; deactivating a user immediately revokes their active refresh tokens.

---

## 3. Creating Courses, Modules & Batches
1. **Categories:** Open **Categories** (`/admin/categories`) and create topic categories (e.g., *Software Engineering*, *Data Science & AI*).
2. **Courses:** Open **Courses** (`/admin/courses`) -> click **+ New Course**. Enter the course code (`CS-FS101`), title, difficulty level, duration weeks, base fee (`$1,200.00`), and set status to `PUBLISHED`.
3. **Batches:** Open **Batches** (`/admin/batches`) -> click **+ Create Batch**:
   - Select the Course and assign a primary **Instructor**.
   - Enter a unique Batch Code (`FSWD-2026A`), start/end dates, schedule days (`Mon,Wed,Fri`), time slot, and **Max Capacity** (`30`).

---

## 4. Enrolling Students & Collecting Fee Installments
1. Navigate to **Enrollments** (`/admin/enrollments`) -> click **+ Quick Enroll**.
2. Choose the Student, Course, and Batch, and enter any scholarship/discount amount.
   - The system automatically checks that `current_strength < max_capacity` and initializes `Pending Amount = Total Fee - Discount`.
3. To record a fee payment:
   - Go to **Payments & Fees** (`/admin/payments`) -> click **+ Record Payment**.
   - Select the Enrollment, enter the installment amount (`<= Pending Amount`), choose the payment method (`UPI`, `CARD`, `CASH`, `BANK_TRANSFER`), and enter the transaction reference.
   - Confirm to automatically update the balance (`Paid + Pending = Net Total Fee`) and generate an official **Payment Receipt Voucher**.

---

## 5. Issuing & Revoking Certificates
1. Navigate to **Certificates** (`/admin/certificates`).
2. Click **Issue Certificate** for an eligible student enrollment.
   - The system verifies all 4 gates: **Completion >= 80%**, **Attendance >= 75%**, **Assessments Passed**, and **Pending Fee == $0.00**.
3. Once issued, the certificate receives a tamper-evident code (`CERT-2026-...`) verifiable publicly at `/verify/{code}`.
4. If a credential must be invalidated, click **Revoke**, enter a mandatory revocation reason, and confirm.

---

## 6. System Settings & Audit Logs
- **System Settings (`/admin/settings`):** Adjust institutional thresholds (`MIN_ATTENDANCE_PCT`, `MIN_COMPLETION_PCT`, lecture/assignment/quiz completion weights).
- **Audit Logs (`/admin/audit-logs`):** Inspect immutable before/after JSON snapshots of every administrative, grading, and financial action.
