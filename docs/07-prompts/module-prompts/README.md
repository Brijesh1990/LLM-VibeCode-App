# NexusLMS — Module-by-Module Prompt Specifications Index
**Document Version:** 1.0.0  
**Prompt Directory:** `docs/07-prompts/module-prompts/`  
**Security & Privacy:** Redacted & Cleaned (Zero Production Secrets, Mock Keys Only)  

---

## Catalog of Module Prompt Documents

| Index | Module Name | Prompt File | Target Endpoints / Subsystems | Status |
| :---: | :--- | :--- | :--- | :---: |
| **01** | Authentication & RBAC | [`01-auth-and-rbac.md`](./01-auth-and-rbac.md) | `/api/v1/auth/*` (JWT, Refresh, Roles) | **Verified** |
| **02** | Users & Profiles | [`02-users-and-profiles.md`](./02-users-and-profiles.md) | `/api/v1/users`, `/students`, `/instructors` | **Verified** |
| **03** | Course Catalog | [`03-course-catalog.md`](./03-course-catalog.md) | `/api/v1/categories`, `/courses`, `/modules` | **Verified** |
| **04** | Cohort Batches | [`04-cohort-batches.md`](./04-cohort-batches.md) | `/api/v1/batches/*` (Capacity, Roster) | **Verified** |
| **05** | Course Enrollments | [`05-enrollments.md`](./05-enrollments.md) | `/api/v1/enrollments/*` | **Verified** |
| **06** | Video Lectures | [`06-video-lectures.md`](./06-video-lectures.md) | `/api/v1/lectures/*` (Progress Toggle) | **Verified** |
| **07** | Study Materials | [`07-study-materials.md`](./07-study-materials.md) | `/api/v1/materials/*` (Upload/Download) | **Verified** |
| **08** | Assignments & Grading | [`08-assignments-and-submissions.md`](./08-assignments-and-submissions.md) | `/api/v1/assignments/*`, `/submissions/*` | **Verified** |
| **09** | Quizzes & Exams | [`09-quizzes-and-examination.md`](./09-quizzes-and-examination.md) | `/api/v1/quizzes/*` (Timer & Anti-Cheat) | **Verified** |
| **10** | Attendance System | [`10-attendance-system.md`](./10-attendance-system.md) | `/api/v1/attendance/*` (Holiday Formula) | **Verified** |
| **11** | Progress Engine | [`11-student-progress-tracking.md`](./11-student-progress-tracking.md) | `/api/v1/progress/*` (50/30/20 Formula) | **Verified** |
| **12** | Payment Gateway & Fees | [`12-payment-gateway-and-fee-ledger.md`](./12-payment-gateway-and-fee-ledger.md) | `/api/v1/payments/*` (Test Key & PDF) | **Verified** |
| **13** | Certificates Registry | [`13-certificates-and-verification.md`](./13-certificates-and-verification.md) | `/api/v1/certificates/*` (ReportLab PDF) | **Verified** |
| **14** | Announcements & Alerts | [`14-announcements-and-notifications.md`](./14-announcements-and-notifications.md) | `/api/v1/announcements`, `/notifications` | **Verified** |
| **15** | Reports & Analytics | [`15-reports-and-system-settings.md`](./15-reports-and-system-settings.md) | `/api/v1/reports/*`, `/settings/*` | **Verified** |
