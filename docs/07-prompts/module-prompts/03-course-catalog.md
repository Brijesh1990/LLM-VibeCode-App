# Module 03: Course Catalog & Curriculum Hierarchy
**Module Prompt Reference:** `NEXUS-PRM-MOD-03`  
**Target Routes:** `/api/v1/categories`, `/api/v1/courses`, `/api/v1/modules`  
**Security Status:** Sanitized — No Secret Dependencies  

---

### Prompt Specification
```markdown
Construct the hierarchical Curriculum and Course Management subsystem for NexusLMS.

Requirements:
1. Hierarchy:
   - CourseCategory (1) -> Courses (Many) -> CourseModules (Many) -> Lectures (Many) + StudyMaterials (Many).
2. Endpoints:
   - GET, POST, PUT, DELETE /api/v1/categories: Academic category taxonomy with active toggle.
   - GET /api/v1/courses: Public & authenticated course listing with category filter, search, and instructor filter.
   - GET /api/v1/courses/{id}: Detailed course syllabus with lecture counts, active batches, and duration.
   - POST, PUT, DELETE /api/v1/courses: Admin creation with course_code generation (e.g. CRS-FS-101), fee in USD, thumbnail URL, and completion threshold (default 75%).
   - GET, POST, PUT, DELETE /api/v1/modules: Orderable curriculum units per course.
3. Verification:
   - Ensure dynamic courses display on both the public landing page and the student catalog directly from MySQL `lms_db.courses`.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/courses.py` and `categories.py`.
* **Testing:** 4 published engineering courses dynamically fetched from MySQL: `CRS-FS-101`, `CRS-AI-201`, `CRS-CL-301`, `CRS-UX-401`.
