# Module Specification: Batch Attendance Management (`attendance.md`)

**Module Route Prefix:** `/api/v1/attendance`  
**Database Tables:** `attendance`, `batches`, `enrollments`, `notifications`  

---

## 1. Module Responsibilities
1. Enable Instructors and Admins to record daily session attendance for an entire batch in a single bulk operation (`POST /api/v1/attendance/bulk`).
2. Support 6 canonical session statuses: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `HOLIDAY`, `CANCELLED`.
3. Dynamically compute and synchronize each student's `enrollments.attendance_percentage` using the institutional formula.
4. Dispatch automated low-attendance notifications when a student falls below the `75.0%` eligibility threshold.

---

## 2. Attendance Calculation Implementation
```python
def calculate_student_attendance_pct(records: list[Attendance]) -> float:
    eligible_statuses = {"PRESENT", "LATE", "ABSENT"}
    present_statuses = {"PRESENT", "LATE"}
    
    eligible_classes = [r for r in records if r.status in eligible_statuses]
    if not eligible_classes:
        return 100.0  # No penalty before eligible sessions occur
        
    present_count = sum(1 for r in eligible_classes if r.status in present_statuses)
    return round((present_count / len(eligible_classes)) * 100.0, 2)
```

---

## 3. Upsert & Audit Behavior
- `attendance` enforces `UNIQUE(batch_id, student_id, attendance_date)`.
- Re-submitting attendance for an existing date performs an atomic upsert (`UPDATE status, marked_by, remarks`) and recalculates affected students' attendance percentages immediately.
