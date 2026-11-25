"""Notifications router."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.notification import Notification
from app.models.user import User
from app.schemas.lms_schemas import NotificationCreateRequest
from app.services.lms_service import create_notification
from app.utils.serializers import serialize_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(
    unread_only: bool = Query(default=False),
    limit: int = Query(default=40, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role_name,
            Notification.role_target == "all",
        )
    )
    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifs = query.order_by(Notification.created_at.desc()).limit(limit).all()
    unread_count = sum(1 for n in notifs if not n.is_read)
    return {
        "items": [serialize_notification(n) for n in notifs],
        "total": len(notifs),
        "unread_count": unread_count,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def send_notification(
    payload: NotificationCreateRequest,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    notif = create_notification(
        db=db,
        title=payload.title.strip(),
        message=payload.message.strip(),
        notification_type=payload.notification_type,
        user_id=payload.user_id,
        role_target=payload.role_target or ("all" if not payload.user_id else None),
    )
    db.commit()
    db.refresh(notif)
    return serialize_notification(notif)


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notif.is_read = True
    notif.read_at = datetime.now()
    db.commit()
    return serialize_notification(notif)


@router.put("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        or_(
            Notification.user_id == current_user.id,
            Notification.role_target == current_user.role_name,
            Notification.role_target == "all",
        ),
        Notification.is_read == False,
    ).update({"is_read": True, "read_at": datetime.now()}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read."}
