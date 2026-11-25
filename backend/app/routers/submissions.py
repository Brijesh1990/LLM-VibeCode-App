"""Assignment Submissions and Evaluation router."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.submission import AssignmentFeedback, Submission
from app.models.user import User
from app.schemas.lms_schemas import SubmissionEvaluateRequest
from app.services.lms_service import (
    create_notification,
    log_audit,
    recalculate_student_course_progress,
)
from app.storage.file_storage import validate_and_save_upload
from app.utils.serializers import serialize_submission

router = APIRouter(prefix="/submissions", tags=["Submissions & Evaluations"])


@router.get("")
def list_submissions(
    assignment_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    student_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Submission).join(Assignment)
    if current_user.role_name == "student":
        query = query.filter(Submission.student_id == current_user.id)
    elif current_user.role_name == "instructor":
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Assignment.course_id.in_(assigned_course_ids or [-1]))
        if student_id:
            query = query.filter(Submission.student_id == student_id)
    elif student_id:
        query = query.filter(Submission.student_id == student_id)

    if assignment_id:
        query = query.filter(Submission.assignment_id == assignment_id)
    if course_id:
        query = query.filter(Assignment.course_id == course_id)
    if status_filter:
        query = query.filter(Submission.status == status_filter)

    submissions = query.order_by(Submission.submitted_at.desc()).all()
    return {"items": [serialize_submission(s) for s in submissions], "total": len(submissions)}


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_assignment(
    assignment_id: int = Form(...),
    submission_text: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    now = datetime.now()
    is_late = now > assignment.due_date
    if is_late and not assignment.allow_late_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline has passed and late submissions are not permitted for this assignment.",
        )

    file_path = None
    file_name = None
    if file and file.filename:
        saved = validate_and_save_upload(file, subfolder="submissions")
        file_path = saved["file_path"]
        file_name = saved["file_name"]

    if not submission_text and not file_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide written answer text or upload a submission file.",
        )

    sub_status = "late_submission" if is_late else "submitted"
    existing = (
        db.query(Submission)
        .filter(
            Submission.assignment_id == assignment_id,
            Submission.student_id == current_user.id,
        )
        .first()
    )
    if existing:
        existing.submission_text = submission_text or existing.submission_text
        if file_path:
            existing.file_path = file_path
            existing.file_name = file_name
        existing.submitted_at = now
        existing.is_late = is_late
        existing.status = sub_status
        submission = existing
    else:
        submission = Submission(
            assignment_id=assignment_id,
            student_id=current_user.id,
            submission_text=submission_text,
            file_path=file_path,
            file_name=file_name,
            submitted_at=now,
            is_late=is_late,
            status=sub_status,
        )
        db.add(submission)

    db.flush()
    recalculate_student_course_progress(
        db=db, student_id=current_user.id, course_id=assignment.course_id
    )
    db.commit()
    db.refresh(submission)
    return serialize_submission(submission)


@router.put("/{submission_id}/evaluate")
def evaluate_submission(
    submission_id: int,
    payload: SubmissionEvaluateRequest,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    assignment = submission.assignment
    if assignment and payload.marks_obtained > assignment.max_marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Awarded marks ({payload.marks_obtained}) cannot exceed assignment maximum ({assignment.max_marks}).",
        )

    submission.marks_obtained = payload.marks_obtained
    submission.status = "evaluated"
    submission.evaluated_by = current_user.id
    submission.evaluated_at = datetime.now()

    fb = AssignmentFeedback(
        submission_id=submission.id,
        instructor_id=current_user.id,
        feedback_text=payload.feedback_text.strip(),
        rubric_notes=payload.rubric_notes,
    )
    db.add(fb)
    db.flush()

    if assignment:
        recalculate_student_course_progress(
            db=db, student_id=submission.student_id, course_id=assignment.course_id
        )

    create_notification(
        db=db,
        user_id=submission.student_id,
        title=f"Assignment Evaluated: {assignment.title if assignment else 'Submission'}",
        message=f"You scored {payload.marks_obtained}/{assignment.max_marks if assignment else 100} marks. Feedback: {payload.feedback_text[:100]}",
        notification_type="evaluation",
        reference_type="submission",
        reference_id=submission.id,
    )
    log_audit(
        db=db,
        action="EVALUATE_SUBMISSION",
        entity_type="Submission",
        entity_id=submission.id,
        user_id=current_user.id,
        new_values={"marks_obtained": payload.marks_obtained},
    )
    db.commit()
    db.refresh(submission)
    return serialize_submission(submission)
