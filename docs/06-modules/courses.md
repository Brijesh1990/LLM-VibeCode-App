# Module Specification: Course Catalog & Categories (`courses.md`)

**Module Route Prefix:** `/api/v1/categories`, `/api/v1/courses`  
**Database Tables:** `course_categories`, `courses`, `course_modules`  

---

## 1. Module Responsibilities
1. Maintain a structured taxonomy of `course_categories` with URL slugs and visibility flags.
2. Manage the full lifecycle of `courses` (`DRAFT` -> `PUBLISHED` -> `ARCHIVED`) including course code, tuition fee (`base_fee`), difficulty level, and duration in weeks.
3. Organize course curricula into ordered `course_modules` (`sort_order`) that group lectures and study materials.

---

## 2. Key Business Rules
- **Unique Identifiers:** Every course requires a unique institutional `code` (e.g., `CS-FS101`) and URL-friendly `slug`.
- **Publication Gate:** A course cannot transition from `DRAFT` to `PUBLISHED` unless it has a valid `base_fee >= 0` and belongs to an active `course_category`.
- **Safe Deletion Policy:**
  - If a course has `0` batches and `0` enrollments and is in `DRAFT` state, an Admin may delete it.
  - If any batch or enrollment references the course, deletion requests automatically transition the course to `status = 'ARCHIVED'` to preserve historical transcripts and certificates.

---

## 3. Role Permissions
- **Admin:** Full CRUD across categories, courses, and modules.
- **Instructor:** Read all published courses; create/edit/reorder `course_modules` for courses where the instructor is assigned to an active batch.
- **Student & Public:** Read-only access to `PUBLISHED` courses and their syllabus module outlines.
