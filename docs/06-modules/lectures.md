# Module Specification: Lectures, Study Materials & Progress (`lectures.md`)

**Module Route Prefix:** `/api/v1/lectures`, `/api/v1/materials`, `/api/v1/progress`  
**Database Tables:** `lectures`, `study_materials`, `lecture_progress`, `enrollments`  

---

## 1. Module Responsibilities
1. Deliver ordered video/live lessons (`lectures`) nested inside `course_modules`.
2. Host and serve validated downloadable study resources (`study_materials`: PDFs, slides, starter archives).
3. Track granular student consumption (`lecture_progress`) including `watch_time_seconds`, `last_position_seconds`, and `is_completed`.
4. Trigger automatic recalculation of the student's weighted course completion (`50%` lecture weight).

---

## 2. Lecture Completion & Progress Engine
1. **Heartbeat Updates (`POST /api/v1/progress/lectures/{lecture_id}`):**
   - Student player sends current `watch_time_seconds` and `last_position_seconds`.
   - If `watch_time_seconds >= 0.90 * (lecture.duration_minutes * 60)` or `is_completed = True` is explicitly passed, the server marks `lecture_progress.is_completed = True` and sets `completed_at = UTC_NOW()`.
2. **Cascade Recalculation:**
   - Upon marking a lecture complete, the Progress Service computes:
     $$L_{\%} = \frac{\text{Completed Published Lectures}}{\text{Total Published Lectures}} \times 100$$
   - Combines $L_{\%}$ with Assignment ($A_{\%}$) and Quiz ($Q_{\%}$) completion to update `enrollments.completion_percentage`.

---

## 3. Access Control Rules
- Lectures with `is_free_preview = True` are accessible to all users for catalog preview.
- Non-preview lectures and downloadable `study_materials` verify that the requesting `STUDENT` holds an `ACTIVE` or `COMPLETED` enrollment in the course.
