"""Batches CRUD and roster management router with capacity and date validation."""
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import (
    get_current_user,
    require_admin,
    require_instructor_or_admin,
)
from app.models.batch import Batch, BatchStudent
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.lms_schemas import BatchCreateUpdate, BatchStudentAssignRequest
from app.services.lms_service import create_notification, log_audit
from app.utils.serializers import serialize_batch

router = APIRouter(prefix="/batches", tags=["Batches"])


@router.get("")
def list_batches(
    course_id: Optional[int] = Query(default=None),
    instructor_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Batch)
    if current_user.role_name == "instructor" and not instructor_id:
        query = query.filter(Batch.instructor_id == current_user.id)
    elif instructor_id:
        query = query.filter(Batch.instructor_id == instructor_id)

    if course_id:
        query = query.filter(Batch.course_id == course_id)
    if status_filter:
        query = query.filter(Batch.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Batch.name.ilike(term), Batch.batch_code.ilike(term)))

    batches = query.order_by(Batch.start_date.desc()).all()
    return {"items": [serialize_batch(b) for b in batches], "total": len(batches)}


@router.get("/{batch_id}")
def get_batch(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")
    return serialize_batch(batch)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_batch(
    payload: BatchCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch end date cannot be earlier than start date.",
        )

    code = (payload.batch_code or f"BAT-{uuid.uuid4().hex[:6].upper()}").strip().upper()
    if db.query(Batch).filter(Batch.batch_code == code).first():
        code = f"{code}-{uuid.uuid4().hex[:3].upper()}"

    batch = Batch(
        batch_code=code,
        name=payload.name.strip(),
        course_id=payload.course_id,
        instructor_id=payload.instructor_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        class_days=payload.class_days,
        class_timing=payload.class_timing,
        capacity=payload.capacity,
        status=payload.status,
    )
    db.add(batch)
    db.flush()

    create_notification(
        db=db,
        role_target="all",
        title=f"New Batch Scheduled: {batch.name}",
        message=f"Batch '{batch.name}' ({batch.batch_code}) starts on {batch.start_date}.",
        notification_type="batch",
        reference_type="batch",
        reference_id=batch.id,
    )
    log_audit(
        db=db,
        action="CREATE_BATCH",
        entity_type="Batch",
        entity_id=batch.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(batch)
    return serialize_batch(batch)


@router.put("/{batch_id}")
def update_batch(
    batch_id: int,
    payload: BatchCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch end date cannot be earlier than start date.",
        )

    active_count = len([bs for bs in (batch.batch_students or []) if bs.status == "active"])
    if payload.capacity < active_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reduce capacity below current active enrollment ({active_count} students).",
        )

    batch.name = payload.name.strip()
    batch.course_id = payload.course_id
    if current_user.role_name == "admin":
        batch.instructor_id = payload.instructor_id
    batch.start_date = payload.start_date
    batch.end_date = payload.end_date
    batch.class_days = payload.class_days
    batch.class_timing = payload.class_timing
    batch.capacity = payload.capacity
    batch.status = payload.status

    db.commit()
    db.refresh(batch)
    return serialize_batch(batch)


@router.post("/{batch_id}/students", status_code=status.HTTP_201_CREATED)
def add_student_to_batch(
    batch_id: int,
    payload: BatchStudentAssignRequest,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    if batch.status in ("closed", "archived"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add students to a {batch.status} batch.",
        )

    active_students = [bs for bs in (batch.batch_students or []) if bs.status == "active"]
    if len(active_students) >= batch.capacity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Batch capacity ({batch.capacity}) reached. Cannot enroll additional students.",
        )

    existing = (
        db.query(BatchStudent)
        .filter(BatchStudent.batch_id == batch_id, BatchStudent.student_id == payload.student_id)
        .first()
    )
    if existing:
        if existing.status == "active":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Student is already assigned to this batch.",
            )
        existing.status = "active"
    else:
        db.add(BatchStudent(batch_id=batch_id, student_id=payload.student_id, status="active"))

    # Also ensure course enrollment exists and links to this batch
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == payload.student_id,
            Enrollment.course_id == batch.course_id,
        )
        .first()
    )
    if not enrollment:
        db.add(
            Enrollment(
                enrollment_number=f"ENR-{uuid.uuid4().hex[:8].upper()}",
                student_id=payload.student_id,
                course_id=batch.course_id,
                batch_id=batch.id,
                status="active",
                completion_percentage=0.0,
            )
        )
    else:
        enrollment.batch_id = batch.id

    db.commit()
    db.refresh(batch)
    return serialize_batch(batch)


@router.delete("/{batch_id}/students/{student_id}")
def remove_student_from_batch(
    batch_id: int,
    student_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    bs = (
        db.query(BatchStudent)
        .filter(BatchStudent.batch_id == batch_id, BatchStudent.student_id == student_id)
        .first()
    )
    if not bs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found in batch.")
    db.delete(bs)
    db.commit()
    return {"message": "Student removed from batch roster."}


@router.delete("/{batch_id}")
def close_or_archive_batch(
    batch_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found.")

    batch.status = "archived"
    db.commit()
    return {"message": f"Batch '{batch.name}' archived."}
