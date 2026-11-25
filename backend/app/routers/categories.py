"""Course Categories CRUD router."""
import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.course import Course
from app.models.course_category import CourseCategory
from app.models.user import User
from app.schemas.lms_schemas import CategoryCreateUpdate
from app.utils.serializers import serialize_category

router = APIRouter(prefix="/categories", tags=["Course Categories"])


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


@router.get("")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(CourseCategory).order_by(CourseCategory.name.asc()).all()
    items = []
    for c in cats:
        count = (
            db.query(func.count(Course.id))
            .filter(Course.category_id == c.id, Course.is_deleted == False)
            .scalar()
            or 0
        )
        items.append(serialize_category(c, courses_count=count))
    return {"items": items, "total": len(items)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    slug = slugify(payload.name)
    if db.query(CourseCategory).filter(CourseCategory.slug == slug).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this name already exists.",
        )
    cat = CourseCategory(
        name=payload.name.strip(),
        slug=slug,
        description=payload.description,
        icon=payload.icon or "BookOpen",
        is_active=payload.is_active,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return serialize_category(cat, courses_count=0)


@router.put("/{category_id}")
def update_category(
    category_id: int,
    payload: CategoryCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cat = db.query(CourseCategory).filter(CourseCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    cat.name = payload.name.strip()
    cat.slug = slugify(payload.name)
    cat.description = payload.description
    cat.icon = payload.icon or cat.icon
    cat.is_active = payload.is_active
    db.commit()
    db.refresh(cat)
    count = (
        db.query(func.count(Course.id))
        .filter(Course.category_id == cat.id, Course.is_deleted == False)
        .scalar()
        or 0
    )
    return serialize_category(cat, courses_count=count)


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    cat = db.query(CourseCategory).filter(CourseCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    active_courses = (
        db.query(func.count(Course.id))
        .filter(Course.category_id == category_id, Course.is_deleted == False)
        .scalar()
        or 0
    )
    if active_courses > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete category with {active_courses} active course(s). Reassign or archive courses first.",
        )
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully."}
