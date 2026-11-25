"""Attendance management router with duplicate prevention, audit trails, and percentage calculation."""
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.attendance import Attendance
from app.models.batch import Batch
from app.models.course import Course
from app.models.user import User
from app.schemas.lms_schemas import AttendanceBulkMarkRequest
from app.services.lms_service import calculate_attendance_stats, log_audit
from app.utils.serializers import serialize_attendance

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("")
def list_attendance(
    batch_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    student_id: Optional[int] = Query(default=None),
    attendance_date: Optional[date] = Query(default=None),
    month: Optional[int] = Query(default=None, ge=1, le=12),
    year: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance)
    target_student_id = student_id
    if current_user.role_name == "student":
        target_student_id = current_user.id
        query = query.filter(Attendance.student_id == current_user.id)
    elif current_user.role_name == "instructor" and not batch_id and not course_id:
        assigned_batch_ids = [
            b[0] for b in db.query(Batch.id).filter(Batch.instructor_id == current_user.id).all()
        ]
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(
            (Attendance.batch_id.in_(assigned_batch_ids or [-1]))
            | (Attendance.course_id.in_(assigned_course_ids or [-1]))
        )

    if target_student_id and current_user.role_name != "student":
        query = query.filter(Attendance.student_id == target_student_id)
    if batch_id:
        query = query.filter(Attendance.batch_id == batch_id)
    if course_id:
        query = query.filter(Attendance.course_id == course_id)
    if attendance_date:
        query = query.filter(Attendance.attendance_date == attendance_date)
    if month:
        query = query.filter(extract("month", Attendance.attendance_date) == month)
    if year:
        query = query.filter(extract("year", Attendance.attendance_date) == year)

    records = query.order_by(Attendance.attendance_date.desc()).all()
    summary = calculate_attendance_stats(
        db=db,
        student_id=target_student_id,
        batch_id=batch_id,
        course_id=course_id,
    )
    return {
        "items": [serialize_attendance(r) for r in records],
        "total": len(records),
        "summary": summary,
    }


@router.post("/mark", status_code=status.HTTP_200_OK)
def mark_batch_attendance(
    payload: AttendanceBulkMarkRequest,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    course_id = payload.course_id or batch.course_id
    saved_records = []

    for item in payload.records:
        existing = (
            db.query(Attendance)
            .filter(
                Attendance.batch_id == payload.batch_id,
                Attendance.student_id == item.student_id,
                Attendance.attendance_date == payload.attendance_date,
            )
            .first()
        )
        if existing:
            old_status = existing.status
            existing.status = item.status
            existing.session_status = payload.session_status
            existing.remarks = item.remarks
            existing.updated_by = current_user.id
            saved_records.append(existing)
            if old_status != item.status:
                log_audit(
                    db=db,
                    action="UPDATE_ATTENDANCE",
                    entity_type="Attendance",
                    entity_id=existing.id,
                    user_id=current_user.id,
                    old_values={"status": old_status, "date": str(payload.attendance_date)},
                    new_values={"status": item.status, "date": str(payload.attendance_date)},
                )
        else:
            rec = Attendance(
                batch_id=payload.batch_id,
                course_id=course_id,
                student_id=item.student_id,
                attendance_date=payload.attendance_date,
                session_status=payload.session_status,
                status=item.status,
                remarks=item.remarks,
                marked_by=current_user.id,
                updated_by=current_user.id,
            )
            db.add(rec)
            saved_records.append(rec)

    db.commit()
    for r in saved_records:
        db.refresh(r)

    return {
        "message": f"Attendance recorded for {len(saved_records)} student(s) on {payload.attendance_date}.",
        "items": [serialize_attendance(r) for r in saved_records],
    }
