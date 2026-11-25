"""Courses and Course Modules CRUD router with safe deletion & instructor authorization."""
from decimal import Decimal
import re
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import (
    get_current_user,
    require_admin,
    require_instructor_or_admin,
)
from app.models.batch import Batch
from app.models.course import Course
from app.models.course_module import CourseModule
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture
from app.models.user import User
from app.schemas.lms_schemas import CourseCreateUpdate, CourseModuleCreateUpdate
from app.services.lms_service import create_notification, log_audit
from app.utils.serializers import serialize_course, serialize_module

router = APIRouter(tags=["Courses & Modules"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


@router.get("/courses")
def list_courses(
    search: Optional[str] = Query(default=None),
    category_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    instructor_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Course).filter(Course.is_deleted == False)
    if category_id:
        query = query.filter(Course.category_id == category_id)
    if status_filter:
        query = query.filter(Course.status == status_filter)
    if instructor_id:
        query = query.filter(Course.instructor_id == instructor_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Course.title.ilike(term),
                Course.course_code.ilike(term),
                Course.description.ilike(term),
            )
        )

    courses = query.order_by(Course.created_at.desc()).all()
    items = []
    for c in courses:
        e_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == c.id).scalar() or 0
        l_count = db.query(func.count(Lecture.id)).filter(Lecture.course_id == c.id).scalar() or 0
        b_count = db.query(func.count(Batch.id)).filter(Batch.course_id == c.id).scalar() or 0
        items.append(
            serialize_course(
                c,
                enrollments_count=e_count,
                lectures_count=l_count,
                batches_count=b_count,
            )
        )
    return {"items": items, "total": len(items)}


@router.get("/courses/{course_id}")
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    e_count = db.query(func.count(Enrollment.id)).filter(Enrollment.course_id == course.id).scalar() or 0
    l_count = db.query(func.count(Lecture.id)).filter(Lecture.course_id == course.id).scalar() or 0
    b_count = db.query(func.count(Batch.id)).filter(Batch.course_id == course.id).scalar() or 0
    data = serialize_course(course, enrollments_count=e_count, lectures_count=l_count, batches_count=b_count)
    return data


@router.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    code = (payload.course_code or f"CRS-{uuid.uuid4().hex[:6].upper()}").strip().upper()
    if db.query(Course).filter(Course.course_code == code).first():
        code = f"{code}-{uuid.uuid4().hex[:3].upper()}"

    base_slug = slugify(payload.title)
    slug = base_slug
    if db.query(Course).filter(Course.slug == slug).first():
        slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    course = Course(
        course_code=code,
        title=payload.title.strip(),
        slug=slug,
        category_id=payload.category_id,
        instructor_id=payload.instructor_id,
        description=payload.description,
        duration_weeks=payload.duration_weeks,
        duration_hours=payload.duration_hours,
        fee=Decimal(str(payload.fee)),
        thumbnail_url=payload.thumbnail_url,
        level=payload.level,
        status=payload.status,
        completion_threshold_pct=payload.completion_threshold_pct,
    )
    db.add(course)
    db.flush()

    create_notification(
        db=db,
        role_target="all",
        title=f"New Course Launched: {course.title}",
        message=f"Course '{course.title}' ({course.course_code}) is now available in the catalog.",
        notification_type="course",
        reference_type="course",
        reference_id=course.id,
    )
    log_audit(
        db=db,
        action="CREATE_COURSE",
        entity_type="Course",
        entity_id=course.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(course)
    return serialize_course(course)


@router.put("/courses/{course_id}")
def update_course(
    course_id: int,
    payload: CourseCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if current_user.role_name == "instructor" and course.instructor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify courses assigned to you.",
        )

    course.title = payload.title.strip()
    course.category_id = payload.category_id
    if current_user.role_name == "admin":
        course.instructor_id = payload.instructor_id
        course.fee = Decimal(str(payload.fee))
    course.description = payload.description
    course.duration_weeks = payload.duration_weeks
    course.duration_hours = payload.duration_hours
    if payload.thumbnail_url is not None:
        course.thumbnail_url = payload.thumbnail_url
    course.level = payload.level
    course.status = payload.status
    course.completion_threshold_pct = payload.completion_threshold_pct

    log_audit(
        db=db,
        action="UPDATE_COURSE",
        entity_type="Course",
        entity_id=course.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(course)
    return serialize_course(course)


@router.delete("/courses/{course_id}")
def delete_or_archive_course(
    course_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    active_enrollments = (
        db.query(func.count(Enrollment.id))
        .filter(Enrollment.course_id == course_id, Enrollment.status == "active")
        .scalar()
        or 0
    )
    if active_enrollments > 0:
        # Prevent unsafe hard deletion when dependent enrollments exist; archive instead
        course.status = "archived"
        db.commit()
        return {
            "message": f"Course has {active_enrollments} active enrollment(s). Safely archived instead of hard-deleting.",
            "status": "archived",
        }

    course.is_deleted = True
    course.status = "archived"
    log_audit(
        db=db,
        action="DELETE_COURSE",
        entity_type="Course",
        entity_id=course.id,
        user_id=current_user.id,
    )
    db.commit()
    return {"message": f"Course '{course.title}' has been deleted."}


@router.get("/modules")
def list_modules(
    course_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(CourseModule).join(Course).filter(Course.is_deleted == False)
    if course_id:
        query = query.filter(CourseModule.course_id == course_id)
    modules = query.order_by(CourseModule.course_id.asc(), CourseModule.sort_order.asc()).all()
    return {"items": [serialize_module(m) for m in modules], "total": len(modules)}


@router.post("/modules", status_code=status.HTTP_201_CREATED)
def create_module(
    payload: CourseModuleCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    if current_user.role_name == "instructor" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this course.")

    mod = CourseModule(
        course_id=payload.course_id,
        title=payload.title.strip(),
        description=payload.description,
        sort_order=payload.sort_order,
        is_published=payload.is_published,
    )
    db.add(mod)
    db.commit()
    db.refresh(mod)
    return serialize_module(mod)


@router.put("/modules/{module_id}")
def update_module(
    module_id: int,
    payload: CourseModuleCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    mod = db.query(CourseModule).filter(CourseModule.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course module not found.")

    mod.course_id = payload.course_id
    mod.title = payload.title.strip()
    mod.description = payload.description
    mod.sort_order = payload.sort_order
    mod.is_published = payload.is_published
    db.commit()
    db.refresh(mod)
    return serialize_module(mod)


@router.delete("/modules/{module_id}")
def delete_module(
    module_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    mod = db.query(CourseModule).filter(CourseModule.id == module_id).first()
    if not mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course module not found.")
    db.delete(mod)
    db.commit()
    return {"message": "Course module deleted successfully."}
