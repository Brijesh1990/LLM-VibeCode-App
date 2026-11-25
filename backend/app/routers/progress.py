"""Student Progress Tracking router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.batch import Batch
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.services.lms_service import (
    calculate_attendance_stats,
    recalculate_student_course_progress,
)

router = APIRouter(prefix="/progress", tags=["Student Progress"])


@router.get("")
def get_progress_overview(
    student_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Enrollment)
    if current_user.role_name == "student":
        query = query.filter(Enrollment.student_id == current_user.id)
    elif current_user.role_name == "instructor":
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        assigned_batch_ids = [
            b[0] for b in db.query(Batch.id).filter(Batch.instructor_id == current_user.id).all()
        ]
        query = query.filter(
            (Enrollment.course_id.in_(assigned_course_ids or [-1]))
            | (Enrollment.batch_id.in_(assigned_batch_ids or [-1]))
        )
        if student_id:
            query = query.filter(Enrollment.student_id == student_id)
    elif student_id:
        query = query.filter(Enrollment.student_id == student_id)

    if course_id:
        query = query.filter(Enrollment.course_id == course_id)
    if batch_id:
        query = query.filter(Enrollment.batch_id == batch_id)

    enrollments = query.all()
    items = []
    for e in enrollments:
        prog = recalculate_student_course_progress(
            db=db, student_id=e.student_id, course_id=e.course_id
        )
        prog["enrollment_id"] = e.id
        prog["student_name"] = e.student.full_name if e.student else ""
        prog["student_email"] = e.student.email if e.student else ""
        prog["student_code"] = (
            (e.student.student_code or f"STU-{e.student.id:04d}") if e.student else ""
        )
        prog["batch_id"] = e.batch_id
        prog["batch_name"] = e.batch.name if e.batch else "Direct Cohort"
        prog["enrollment_status"] = e.status
        items.append(prog)

    db.commit()
    overall_completion = (
        round(sum(i["completion_percentage"] for i in items) / len(items), 1)
        if items
        else 0.0
    )
    overall_attendance = (
        round(sum(i["attendance_percentage"] for i in items) / len(items), 1)
        if items
        else 100.0
    )
    return {
        "items": items,
        "total": len(items),
        "overall_completion_percentage": overall_completion,
        "overall_attendance_percentage": overall_attendance,
    }
