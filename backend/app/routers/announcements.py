"""Announcements router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.lms_schemas import AnnouncementCreateUpdate
from app.services.lms_service import create_notification
from app.utils.serializers import serialize_announcement

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("")
def list_announcements(
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Announcement).filter(Announcement.is_active == True)
    if current_user.role_name != "admin":
        query = query.filter(
            or_(
                Announcement.target_role == "all",
                Announcement.target_role == current_user.role_name,
            )
        )
    if course_id:
        query = query.filter(Announcement.course_id == course_id)
    if batch_id:
        query = query.filter(Announcement.batch_id == batch_id)

    items = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()
    return {"items": [serialize_announcement(a) for a in items], "total": len(items)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    ann = Announcement(
        title=payload.title.strip(),
        content=payload.content.strip(),
        target_role=payload.target_role,
        course_id=payload.course_id,
        batch_id=payload.batch_id,
        is_pinned=payload.is_pinned,
        is_active=payload.is_active,
        published_by=current_user.id,
    )
    db.add(ann)
    db.flush()

    create_notification(
        db=db,
        role_target=payload.target_role,
        title=f"Announcement: {ann.title}",
        message=ann.content[:140],
        notification_type="general",
        reference_type="announcement",
        reference_id=ann.id,
    )
    db.commit()
    db.refresh(ann)
    return serialize_announcement(ann)


@router.put("/{announcement_id}")
def update_announcement(
    announcement_id: int,
    payload: AnnouncementCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")

    ann.title = payload.title.strip()
    ann.content = payload.content.strip()
    ann.target_role = payload.target_role
    ann.course_id = payload.course_id
    ann.batch_id = payload.batch_id
    ann.is_pinned = payload.is_pinned
    ann.is_active = payload.is_active
    db.commit()
    db.refresh(ann)
    return serialize_announcement(ann)


@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found.")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted."}
