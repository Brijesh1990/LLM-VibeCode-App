# Module 07: Downloadable Study Materials & Storage Security
**Module Prompt Reference:** `NEXUS-PRM-MOD-07`  
**Target Routes:** `/api/v1/materials/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Construct the authorized Study Material file distribution module for NexusLMS.

Requirements:
1. Endpoints:
   - GET /api/v1/materials: Filter materials by course_id and module_id.
   - POST /api/v1/materials/upload: Multipart upload restricted to allowed extensions (pdf, ppt, pptx, doc, docx, zip, mp4) with 50MB file size limit.
   - GET /api/v1/materials/{id}/download: Validates student enrollment before streaming the file via FileResponse.
2. Storage Architecture:
   - Disk paths sanitized with unique UUID prefixes to prevent directory traversal (`..`) attacks.
   - Static mounting on `/uploads` guarded by CORS and authentication.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/materials.py`.
* **Testing:** 3 course handbooks and slide decks verified for authorized student download.
