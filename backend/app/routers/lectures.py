"""Lectures and Lecture Completion router."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture, LectureProgress
from app.models.user import User
from app.schemas.lms_schemas import LectureCompleteRequest, LectureCreateUpdate
from app.services.lms_service import (
    create_notification,
    recalculate_student_course_progress,
)
from app.storage.file_storage import validate_and_save_upload
from app.utils.serializers import serialize_lecture

router = APIRouter(prefix="/lectures", tags=["Lectures"])


@router.get("")
def list_lectures(
    course_id: Optional[int] = Query(default=None),
    module_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Lecture)
    if current_user.role_name == "student":
        enrolled_course_ids = [
            e[0]
            for e in db.query(Enrollment.course_id)
            .filter(Enrollment.student_id == current_user.id)
            .all()
        ]
        query = query.filter(
            Lecture.course_id.in_(enrolled_course_ids or [-1]),
            Lecture.is_published == True,
        )
    elif current_user.role_name == "instructor" and not course_id:
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Lecture.course_id.in_(assigned_course_ids or [-1]))

    if course_id:
        query = query.filter(Lecture.course_id == course_id)
    if module_id:
        query = query.filter(Lecture.module_id == module_id)
    if batch_id:
        query = query.filter(Lecture.batch_id == batch_id)

    lectures = query.order_by(Lecture.course_id.asc(), Lecture.sort_order.asc()).all()

    completed_lecture_ids = set()
    if current_user.role_name == "student":
        completed_lecture_ids = {
            lp[0]
            for lp in db.query(LectureProgress.lecture_id)
            .filter(
                LectureProgress.student_id == current_user.id,
                LectureProgress.is_completed == True,
            )
            .all()
        }

    return {
        "items": [serialize_lecture(l, is_completed=(l.id in completed_lecture_ids)) for l in lectures],
        "total": len(lectures),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_lecture(
    payload: LectureCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
    if current_user.role_name == "instructor" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this course.")

    lecture = Lecture(
        course_id=payload.course_id,
        module_id=payload.module_id,
        batch_id=payload.batch_id,
        title=payload.title.strip(),
        description=payload.description,
        video_url=payload.video_url,
        duration_minutes=payload.duration_minutes,
        sort_order=payload.sort_order,
        scheduled_at=payload.scheduled_at,
        is_published=payload.is_published,
        created_by=current_user.id,
    )
    db.add(lecture)
    db.flush()

    create_notification(
        db=db,
        role_target="student",
        title=f"New Lecture Published: {lecture.title}",
        message=f"A new lecture '{lecture.title}' has been added to {course.title}.",
        notification_type="lecture",
        reference_type="lecture",
        reference_id=lecture.id,
    )
    db.commit()
    db.refresh(lecture)
    return serialize_lecture(lecture)


@router.put("/{lecture_id}")
def update_lecture(
    lecture_id: int,
    payload: LectureCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")

    lecture.course_id = payload.course_id
    lecture.module_id = payload.module_id
    lecture.batch_id = payload.batch_id
    lecture.title = payload.title.strip()
    lecture.description = payload.description
    lecture.video_url = payload.video_url
    lecture.duration_minutes = payload.duration_minutes
    lecture.sort_order = payload.sort_order
    lecture.scheduled_at = payload.scheduled_at
    lecture.is_published = payload.is_published
    db.commit()
    db.refresh(lecture)
    return serialize_lecture(lecture)


@router.post("/{lecture_id}/complete")
def toggle_lecture_completion(
    lecture_id: int,
    payload: Optional[LectureCompleteRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")

    is_done = payload.is_completed if payload else True
    watched = payload.watched_seconds if payload else lecture.duration_minutes * 60

    progress = (
        db.query(LectureProgress)
        .filter(
            LectureProgress.student_id == current_user.id,
            LectureProgress.lecture_id == lecture_id,
        )
        .first()
    )
    if progress:
        progress.is_completed = is_done
        progress.watched_seconds = max(progress.watched_seconds, watched)
        progress.completed_at = datetime.now() if is_done else None
    else:
        progress = LectureProgress(
            student_id=current_user.id,
            lecture_id=lecture_id,
            course_id=lecture.course_id,
            is_completed=is_done,
            watched_seconds=watched,
            completed_at=datetime.now() if is_done else None,
        )
        db.add(progress)
    db.flush()

    course_summary = recalculate_student_course_progress(
        db=db, student_id=current_user.id, course_id=lecture.course_id
    )
    db.commit()
    return {
        "lecture_id": lecture_id,
        "is_completed": is_done,
        "course_progress": course_summary,
    }


@router.delete("/{lecture_id}")
def delete_lecture(
    lecture_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    lecture = db.query(Lecture).filter(Lecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lecture not found.")
    db.delete(lecture)
    db.commit()
    return {"message": "Lecture deleted successfully."}
