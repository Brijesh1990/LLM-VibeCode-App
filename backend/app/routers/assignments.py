"""Assignments CRUD router."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.assignment import Assignment
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.submission import Submission
from app.models.user import User
from app.schemas.lms_schemas import AssignmentCreateUpdate
from app.services.lms_service import create_notification, log_audit
from app.utils.serializers import serialize_assignment, serialize_submission

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.get("")
def list_assignments(
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Assignment)
    if current_user.role_name == "student":
        enrolled_course_ids = [
            e[0]
            for e in db.query(Enrollment.course_id)
            .filter(Enrollment.student_id == current_user.id)
            .all()
        ]
        query = query.filter(
            Assignment.course_id.in_(enrolled_course_ids or [-1]),
            Assignment.status == "published",
        )
    elif current_user.role_name == "instructor" and not course_id:
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Assignment.course_id.in_(assigned_course_ids or [-1]))

    if course_id:
        query = query.filter(Assignment.course_id == course_id)
    if batch_id:
        query = query.filter(Assignment.batch_id == batch_id)
    if status_filter:
        query = query.filter(Assignment.status == status_filter)

    assignments = query.order_by(Assignment.due_date.asc()).all()
    items = []
    for a in assignments:
        sub_count = (
            db.query(func.count(Submission.id))
            .filter(Submission.assignment_id == a.id)
            .scalar()
            or 0
        )
        my_sub = None
        if current_user.role_name == "student":
            s = (
                db.query(Submission)
                .filter(
                    Submission.assignment_id == a.id,
                    Submission.student_id == current_user.id,
                )
                .first()
            )
            if s:
                my_sub = serialize_submission(s)
        items.append(serialize_assignment(a, submissions_count=sub_count, my_submission=my_sub))
    return {"items": items, "total": len(items)}


@router.get("/{assignment_id}")
def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")
    sub_count = (
        db.query(func.count(Submission.id))
        .filter(Submission.assignment_id == assignment.id)
        .scalar()
        or 0
    )
    my_sub = None
    if current_user.role_name == "student":
        s = (
            db.query(Submission)
            .filter(
                Submission.assignment_id == assignment.id,
                Submission.student_id == current_user.id,
            )
            .first()
        )
        if s:
            my_sub = serialize_submission(s)
    return serialize_assignment(assignment, submissions_count=sub_count, my_submission=my_sub)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: AssignmentCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    if payload.passing_marks > payload.max_marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passing marks cannot exceed maximum marks.",
        )

    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    assignment = Assignment(
        course_id=payload.course_id,
        batch_id=payload.batch_id,
        module_id=payload.module_id,
        title=payload.title.strip(),
        description=payload.description,
        instructions=payload.instructions,
        max_marks=payload.max_marks,
        passing_marks=payload.passing_marks,
        due_date=payload.due_date,
        allow_late_submission=payload.allow_late_submission,
        status=payload.status,
        created_by=current_user.id,
    )
    db.add(assignment)
    db.flush()

    create_notification(
        db=db,
        role_target="student",
        title=f"New Assignment: {assignment.title}",
        message=f"Assignment '{assignment.title}' for {course.title} is due on {assignment.due_date.strftime('%Y-%m-%d %H:%M')}.",
        notification_type="assignment",
        reference_type="assignment",
        reference_id=assignment.id,
    )
    log_audit(
        db=db,
        action="CREATE_ASSIGNMENT",
        entity_type="Assignment",
        entity_id=assignment.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(assignment)
    return serialize_assignment(assignment)


@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: int,
    payload: AssignmentCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    if payload.passing_marks > payload.max_marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passing marks cannot exceed maximum marks.",
        )

    assignment.course_id = payload.course_id
    assignment.batch_id = payload.batch_id
    assignment.module_id = payload.module_id
    assignment.title = payload.title.strip()
    assignment.description = payload.description
    assignment.instructions = payload.instructions
    assignment.max_marks = payload.max_marks
    assignment.passing_marks = payload.passing_marks
    assignment.due_date = payload.due_date
    assignment.allow_late_submission = payload.allow_late_submission
    assignment.status = payload.status
    db.commit()
    db.refresh(assignment)
    return serialize_assignment(assignment)


@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully."}
