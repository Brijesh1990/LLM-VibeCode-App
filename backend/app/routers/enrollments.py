"""Enrollments CRUD router with capacity check and automatic batch roster sync."""
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import (
    get_current_user,
    require_admin,
    require_instructor_or_admin,
)
from app.models.batch import Batch, BatchStudent
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.lms_schemas import EnrollmentCreateUpdate
from app.services.lms_service import (
    create_notification,
    log_audit,
    recalculate_student_course_progress,
)
from app.utils.serializers import serialize_enrollment

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.get("")
def list_enrollments(
    student_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Enrollment)
    if current_user.role_name == "student":
        query = query.filter(Enrollment.student_id == current_user.id)
    elif student_id:
        query = query.filter(Enrollment.student_id == student_id)

    if current_user.role_name == "instructor":
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Enrollment.course_id.in_(assigned_course_ids or [-1]))

    if course_id:
        query = query.filter(Enrollment.course_id == course_id)
    if batch_id:
        query = query.filter(Enrollment.batch_id == batch_id)
    if status_filter:
        query = query.filter(Enrollment.status == status_filter)

    enrollments = query.order_by(Enrollment.enrolled_at.desc()).all()
    return {"items": [serialize_enrollment(e) for e in enrollments], "total": len(enrollments)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_enrollment(
    payload: EnrollmentCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_student_id = (
        current_user.id if current_user.role_name == "student" else payload.student_id
    )

    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == target_student_id,
            Enrollment.course_id == payload.course_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student is already enrolled in this course.",
        )

    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if payload.batch_id:
        batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")
        active_in_batch = len([bs for bs in (batch.batch_students or []) if bs.status == "active"])
        if active_in_batch >= batch.capacity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Batch '{batch.name}' has reached its maximum capacity of {batch.capacity}.",
            )
        bs_existing = (
            db.query(BatchStudent)
            .filter(BatchStudent.batch_id == batch.id, BatchStudent.student_id == target_student_id)
            .first()
        )
        if not bs_existing:
            db.add(BatchStudent(batch_id=batch.id, student_id=target_student_id, status="active"))

    enrollment = Enrollment(
        enrollment_number=f"ENR-{uuid.uuid4().hex[:8].upper()}",
        student_id=target_student_id,
        course_id=payload.course_id,
        batch_id=payload.batch_id,
        status=payload.status,
        completion_percentage=0.0,
    )
    db.add(enrollment)
    db.flush()

    create_notification(
        db=db,
        user_id=target_student_id,
        title=f"Enrolled in {course.title}",
        message=f"You have been enrolled in '{course.title}' (Enrollment #{enrollment.enrollment_number}).",
        notification_type="course",
        reference_type="enrollment",
        reference_id=enrollment.id,
    )
    log_audit(
        db=db,
        action="CREATE_ENROLLMENT",
        entity_type="Enrollment",
        entity_id=enrollment.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(enrollment)
    return serialize_enrollment(enrollment)


@router.put("/{enrollment_id}")
def update_enrollment(
    enrollment_id: int,
    payload: EnrollmentCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found.")

    enrollment.batch_id = payload.batch_id
    enrollment.status = payload.status
    db.commit()
    db.refresh(enrollment)
    return serialize_enrollment(enrollment)


@router.delete("/{enrollment_id}")
def delete_enrollment(
    enrollment_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found.")
    db.delete(enrollment)
    db.commit()
    return {"message": "Enrollment record deleted."}
