# Module 14: Broadcast Announcements & In-App Notifications
**Module Prompt Reference:** `NEXUS-PRM-MOD-14`  
**Target Routes:** `/api/v1/announcements/*`, `/api/v1/notifications/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Build the Broadcast Announcement and Real-Time In-App Notification subsystem for NexusLMS.

Requirements:
1. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/announcements: Admin and instructor announcements targeted to specific roles (`all`, `student`, `instructor`) or pinned to top of dashboards.
   - GET /api/v1/notifications: Personal student/faculty notification stream (unread count, notification_type: `payment`, `certificate`, `assignment`, `quiz`).
   - PUT /api/v1/notifications/{id}/read: Mark individual notification read.
   - PUT /api/v1/notifications/mark-all-read: Clear all unread badges.
2. Automation:
   - Automatically trigger notifications upon payment recording, certificate generation, assignment evaluation, and quiz completion.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/announcements.py` and `notifications.py`.
* **Testing:** Verified bell icon unread counter and notification dropdown in Admin, Faculty, and Scholar headers.
