"""Students management router for Admin and Instructor roster access."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.session import get_db
from app.dependencies.auth import require_admin, require_instructor_or_admin
from app.models.batch import Batch, BatchStudent
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.role import Role
from app.models.user import User
from app.schemas.lms_schemas import UserCreateUpdateRequest
from app.services.lms_service import calculate_attendance_stats, log_audit
from app.utils.serializers import serialize_user

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("")
def list_students(
    search: Optional[str] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(User)
        .join(Role)
        .filter(Role.name == "student", User.is_deleted == False)
    )

    # If instructor, restrict to students in their assigned courses or batches
    if current_user.role_name == "instructor":
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        assigned_batch_ids = [
            b[0] for b in db.query(Batch.id).filter(Batch.instructor_id == current_user.id).all()
        ]
        enrolled_student_ids = {
            e[0]
            for e in db.query(Enrollment.student_id)
            .filter(
                or_(
                    Enrollment.course_id.in_(assigned_course_ids or [-1]),
                    Enrollment.batch_id.in_(assigned_batch_ids or [-1]),
                )
            )
            .all()
        }
        batch_student_ids = {
            bs[0]
            for bs in db.query(BatchStudent.student_id)
            .filter(BatchStudent.batch_id.in_(assigned_batch_ids or [-1]))
            .all()
        }
        allowed_ids = list(enrolled_student_ids | batch_student_ids) or [-1]
        query = query.filter(User.id.in_(allowed_ids))

    if course_id:
        c_student_ids = [
            e[0] for e in db.query(Enrollment.student_id).filter(Enrollment.course_id == course_id).all()
        ]
        query = query.filter(User.id.in_(c_student_ids or [-1]))

    if batch_id:
        b_student_ids = [
            bs[0] for bs in db.query(BatchStudent.student_id).filter(BatchStudent.batch_id == batch_id).all()
        ]
        e_student_ids = [
            e[0] for e in db.query(Enrollment.student_id).filter(Enrollment.batch_id == batch_id).all()
        ]
        query = query.filter(User.id.in_(list(set(b_student_ids + e_student_ids)) or [-1]))

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
                User.student_code.ilike(term),
            )
        )

    total = query.count()
    students = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    items = []
    for s in students:
        data = serialize_user(s)
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == s.id).all()
        att = calculate_attendance_stats(db, student_id=s.id)
        data["enrolled_courses_count"] = len(enrollments)
        data["avg_progress"] = (
            round(sum(e.completion_percentage for e in enrollments) / len(enrollments), 1)
            if enrollments
            else 0.0
        )
        data["attendance_percentage"] = att["attendance_percentage"]
        data["enrolled_courses"] = [
            {
                "course_id": e.course_id,
                "course_title": e.course.title if e.course else "",
                "batch_id": e.batch_id,
                "batch_name": e.batch.name if e.batch else "",
                "completion_percentage": round(e.completion_percentage, 1),
                "status": e.status,
            }
            for e in enrollments
        ]
        items.append(data)

    return {"items": items, "total": total, "page": page, "limit": limit}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_student(
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email_clean = payload.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A student or user with this email already exists.",
        )

    role_obj = db.query(Role).filter(Role.name == "student").first()
    if not role_obj:
        role_obj = Role(name="student", description="Student Role")
        db.add(role_obj)
        db.flush()

    student = User(
        role_id=role_obj.id,
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=hash_password(payload.password or "Student@123"),
        bio=payload.bio,
        address=payload.address,
        is_active=payload.is_active,
        is_deleted=False,
    )
    db.add(student)
    db.flush()
    student.student_code = f"STU-{datetime.now().year}-{student.id:04d}"

    log_audit(
        db=db,
        action="CREATE_STUDENT",
        entity_type="User",
        entity_id=student.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(student)
    return serialize_user(student)


@router.get("/{student_id}")
def get_student_detail(
    student_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.is_deleted == False).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    data = serialize_user(student)
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == student.id).all()
    payments = db.query(Payment).filter(Payment.student_id == student.id).all()
    att = calculate_attendance_stats(db, student_id=student.id)

    data["attendance"] = att
    data["enrollments"] = [
        {
            "id": e.id,
            "enrollment_number": e.enrollment_number,
            "course_id": e.course_id,
            "course_title": e.course.title if e.course else "",
            "batch_name": e.batch.name if e.batch else "",
            "completion_percentage": round(e.completion_percentage, 1),
            "status": e.status,
        }
        for e in enrollments
    ]
    data["total_paid"] = float(sum(p.paid_amount for p in payments))
    data["total_pending"] = float(sum(p.pending_amount for p in payments))
    return data


@router.put("/{student_id}")
def update_student(
    student_id: int,
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.is_deleted == False).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    email_clean = payload.email.lower().strip()
    conflict = db.query(User).filter(User.email == email_clean, User.id != student_id).first()
    if conflict:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use.")

    student.full_name = payload.full_name.strip()
    student.email = email_clean
    student.phone = payload.phone
    student.bio = payload.bio
    student.address = payload.address
    student.is_active = payload.is_active
    if payload.password and len(payload.password.strip()) >= 6 and payload.password != "Welcome@123":
        student.password_hash = hash_password(payload.password)

    db.commit()
    db.refresh(student)
    return serialize_user(student)


@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == student_id, User.is_deleted == False).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    student.is_active = False
    student.is_deleted = True
    log_audit(
        db=db,
        action="DELETE_STUDENT",
        entity_type="User",
        entity_id=student.id,
        user_id=current_user.id,
    )
    db.commit()
    return {"message": f"Student '{student.full_name}' deactivated and archived."}
