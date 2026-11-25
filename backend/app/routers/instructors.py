"""Instructors management router."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.batch import Batch
from app.models.course import Course
from app.models.role import Role
from app.models.user import InstructorProfile, User
from app.schemas.lms_schemas import UserCreateUpdateRequest
from app.services.lms_service import log_audit
from app.utils.serializers import serialize_user

router = APIRouter(prefix="/instructors", tags=["Instructors"])


@router.get("")
def list_instructors(
    search: Optional[str] = Query(default=None),
    department: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(User)
        .join(Role)
        .filter(Role.name == "instructor", User.is_deleted == False)
    )
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(User.full_name.ilike(term), User.email.ilike(term)))

    instructors = query.order_by(User.full_name.asc()).all()
    items = []
    for ins in instructors:
        if department and ins.instructor_profile and ins.instructor_profile.department != department:
            continue
        data = serialize_user(ins)
        courses = db.query(Course).filter(Course.instructor_id == ins.id, Course.is_deleted == False).all()
        batches = db.query(Batch).filter(Batch.instructor_id == ins.id).all()
        data["assigned_courses_count"] = len(courses)
        data["assigned_batches_count"] = len(batches)
        data["assigned_courses"] = [{"id": c.id, "title": c.title, "course_code": c.course_code} for c in courses]
        items.append(data)

    return {"items": items, "total": len(items)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_instructor(
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email_clean = payload.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An instructor or user with this email already exists.",
        )

    role_obj = db.query(Role).filter(Role.name == "instructor").first()
    if not role_obj:
        role_obj = Role(name="instructor", description="Instructor Role")
        db.add(role_obj)
        db.flush()

    user = User(
        role_id=role_obj.id,
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=hash_password(payload.password or "Instructor@123"),
        bio=payload.bio,
        address=payload.address,
        is_active=payload.is_active,
        is_deleted=False,
    )
    db.add(user)
    db.flush()

    prof = InstructorProfile(
        user_id=user.id,
        employee_code=f"INS-{datetime.now().year}-{user.id:03d}",
        department=payload.department or "Computer Science & AI",
        designation=payload.designation or "Principal Instructor",
        qualification=payload.qualification or "Ph.D. / M.S.",
        specialization=payload.specialization or "Cloud & Full-Stack Systems",
        experience_years=payload.experience_years or 6,
        joining_date=payload.joining_date or datetime.now().date(),
    )
    db.add(prof)
    log_audit(
        db=db,
        action="CREATE_INSTRUCTOR",
        entity_type="User",
        entity_id=user.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.get("/{instructor_id}")
def get_instructor(
    instructor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == instructor_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor not found.")
    return serialize_user(user)


@router.put("/{instructor_id}")
def update_instructor(
    instructor_id: int,
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == instructor_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor not found.")

    email_clean = payload.email.lower().strip()
    conflict = db.query(User).filter(User.email == email_clean, User.id != instructor_id).first()
    if conflict:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use.")

    user.full_name = payload.full_name.strip()
    user.email = email_clean
    user.phone = payload.phone
    user.bio = payload.bio
    user.address = payload.address
    user.is_active = payload.is_active
    if payload.password and len(payload.password.strip()) >= 6 and payload.password != "Welcome@123":
        user.password_hash = hash_password(payload.password)

    prof = user.instructor_profile
    if not prof:
        prof = InstructorProfile(
            user_id=user.id,
            employee_code=f"INS-{datetime.now().year}-{user.id:03d}",
        )
        db.add(prof)

    prof.department = payload.department or prof.department
    prof.designation = payload.designation or prof.designation
    prof.qualification = payload.qualification or prof.qualification
    prof.specialization = payload.specialization or prof.specialization
    if payload.experience_years is not None:
        prof.experience_years = payload.experience_years
    if payload.joining_date is not None:
        prof.joining_date = payload.joining_date

    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.delete("/{instructor_id}")
def delete_instructor(
    instructor_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == instructor_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instructor not found.")

    user.is_active = False
    user.is_deleted = True
    log_audit(
        db=db,
        action="DELETE_INSTRUCTOR",
        entity_type="User",
        entity_id=user.id,
        user_id=current_user.id,
    )
    db.commit()
    return {"message": f"Instructor '{user.full_name}' deactivated and archived."}
