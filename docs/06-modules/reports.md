# Module Specification: Analytics, Reports & Certificates (`reports.md`)

**Module Route Prefix:** `/api/v1/reports`, `/api/v1/certificates`, `/api/v1/settings`  
**Database Tables:** `certificates`, `audit_logs`, `system_settings`, plus read aggregations across all 31 tables  

---

## 1. Role-Tailored Analytics Dashboards (`/api/v1/reports/dashboard`)
1. **Admin Executive KPIs:**
   - Total active students, instructors, published courses, and ongoing batches.
   - Total tuition revenue collected, total pending fee receivables, and collection efficiency %.
   - Monthly enrollment and revenue time-series data.
   - Batch occupancy utilization (`current_strength / max_capacity`).
2. **Instructor Teaching KPIs:**
   - Assigned batches count and total enrolled students under instruction.
   - Pending assignment submissions awaiting grading.
   - Average batch attendance % and list of at-risk students (`attendance < 75%` or `completion < 50%`).
3. **Student Personal KPIs:**
   - Enrolled courses count, overall weighted completion %, cumulative attendance %.
   - Pending fee balance, upcoming assignment due dates, and earned certificates.

---

## 2. Certificate Generation & Public Verification (`/api/v1/certificates`)
- **Eligibility Verification Engine:** Checks `completion_percentage >= 80%`, `attendance_percentage >= 75%`, passing assessments, and `pending_amount == 0.00`.
- **Public Verification (`/api/v1/certificates/verify/{code}`):**
  - Unauthenticated endpoint allowing employers or academic verifiers to validate any certificate code (`CERT-...`) or `verification_uuid`.
  - Returns live validity state (`ISSUED` vs `REVOKED`), student name, course title, completion grade, and issue date.
