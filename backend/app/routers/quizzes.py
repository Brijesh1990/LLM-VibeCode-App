"""Quizzes, Questions, and Server-Side Examination Scoring router."""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.question import Question, QuizOption
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAnswer, QuizAttempt, QuizAttemptEvent
from app.models.user import User
from app.schemas.lms_schemas import (
    QuestionCreateUpdate,
    QuizCreateUpdate,
    QuizSubmitRequest,
)
from app.services.lms_service import (
    create_notification,
    log_audit,
    recalculate_student_course_progress,
)
from app.utils.serializers import (
    serialize_question,
    serialize_quiz,
    serialize_quiz_attempt,
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes & Examinations"])


@router.get("")
def list_quizzes(
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Quiz)
    include_correct = current_user.role_name in ("admin", "instructor")

    if current_user.role_name == "student":
        enrolled_course_ids = [
            e[0]
            for e in db.query(Enrollment.course_id)
            .filter(Enrollment.student_id == current_user.id)
            .all()
        ]
        query = query.filter(
            Quiz.course_id.in_(enrolled_course_ids or [-1]),
            Quiz.status == "published",
        )
    elif current_user.role_name == "instructor" and not course_id:
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Quiz.course_id.in_(assigned_course_ids or [-1]))

    if course_id:
        query = query.filter(Quiz.course_id == course_id)
    if batch_id:
        query = query.filter(Quiz.batch_id == batch_id)

    quizzes = query.order_by(Quiz.created_at.desc()).all()
    items = []
    for q in quizzes:
        att_count = (
            db.query(func.count(QuizAttempt.id))
            .filter(QuizAttempt.quiz_id == q.id)
            .scalar()
            or 0
        )
        data = serialize_quiz(q, include_correct=include_correct, attempts_count=att_count)
        if current_user.role_name == "student":
            my_attempts = (
                db.query(QuizAttempt)
                .filter(
                    QuizAttempt.quiz_id == q.id,
                    QuizAttempt.student_id == current_user.id,
                )
                .order_by(QuizAttempt.attempt_number.desc())
                .all()
            )
            data["my_attempts_count"] = len(my_attempts)
            data["latest_attempt"] = (
                serialize_quiz_attempt(my_attempts[0], include_answers=False)
                if my_attempts
                else None
            )
        items.append(data)
    return {"items": items, "total": len(items)}


@router.get("/attempts/all")
def list_all_attempts(
    quiz_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    student_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(QuizAttempt).join(Quiz)
    if current_user.role_name == "student":
        query = query.filter(QuizAttempt.student_id == current_user.id)
    elif current_user.role_name == "instructor":
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(Quiz.course_id.in_(assigned_course_ids or [-1]))
        if student_id:
            query = query.filter(QuizAttempt.student_id == student_id)
    elif student_id:
        query = query.filter(QuizAttempt.student_id == student_id)

    if quiz_id:
        query = query.filter(QuizAttempt.quiz_id == quiz_id)
    if course_id:
        query = query.filter(Quiz.course_id == course_id)

    attempts = query.order_by(QuizAttempt.created_at.desc()).all()
    return {"items": [serialize_quiz_attempt(a) for a in attempts], "total": len(attempts)}


@router.get("/{quiz_id}")
def get_quiz_detail(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    # Never expose correct answers to students prior to submission!
    include_correct = current_user.role_name in ("admin", "instructor")
    att_count = (
        db.query(func.count(QuizAttempt.id)).filter(QuizAttempt.quiz_id == quiz.id).scalar() or 0
    )
    return serialize_quiz(quiz, include_correct=include_correct, attempts_count=att_count)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_quiz(
    payload: QuizCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    quiz = Quiz(
        course_id=payload.course_id,
        batch_id=payload.batch_id,
        module_id=payload.module_id,
        title=payload.title.strip(),
        description=payload.description,
        instructions=payload.instructions,
        total_marks=payload.total_marks,
        passing_marks=payload.passing_marks,
        duration_minutes=payload.duration_minutes,
        available_from=payload.available_from,
        available_until=payload.available_until,
        max_attempts=payload.max_attempts,
        allow_retake=payload.allow_retake,
        shuffle_questions=payload.shuffle_questions,
        status=payload.status,
        created_by=current_user.id,
    )
    db.add(quiz)
    db.flush()

    if payload.questions:
        total_q_marks = 0.0
        for idx, q_in in enumerate(payload.questions, start=1):
            question = Question(
                quiz_id=quiz.id,
                question_text=q_in.question_text.strip(),
                question_type=q_in.question_type,
                marks=q_in.marks,
                explanation=q_in.explanation,
                sort_order=q_in.sort_order or idx,
            )
            db.add(question)
            db.flush()
            total_q_marks += q_in.marks
            for o_idx, opt_in in enumerate(q_in.options, start=1):
                db.add(
                    QuizOption(
                        question_id=question.id,
                        option_text=opt_in.option_text.strip(),
                        is_correct=opt_in.is_correct,
                        sort_order=opt_in.sort_order or o_idx,
                    )
                )
        if total_q_marks > 0:
            quiz.total_marks = total_q_marks

    create_notification(
        db=db,
        role_target="student",
        title=f"New Quiz Available: {quiz.title}",
        message=f"Quiz '{quiz.title}' ({quiz.duration_minutes} mins) is now published for {course.title}.",
        notification_type="quiz",
        reference_type="quiz",
        reference_id=quiz.id,
    )
    db.commit()
    db.refresh(quiz)
    return serialize_quiz(quiz, include_correct=True)


@router.put("/{quiz_id}")
def update_quiz(
    quiz_id: int,
    payload: QuizCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    quiz.course_id = payload.course_id
    quiz.batch_id = payload.batch_id
    quiz.module_id = payload.module_id
    quiz.title = payload.title.strip()
    quiz.description = payload.description
    quiz.instructions = payload.instructions
    quiz.total_marks = payload.total_marks
    quiz.passing_marks = payload.passing_marks
    quiz.duration_minutes = payload.duration_minutes
    quiz.available_from = payload.available_from
    quiz.available_until = payload.available_until
    quiz.max_attempts = payload.max_attempts
    quiz.allow_retake = payload.allow_retake
    quiz.shuffle_questions = payload.shuffle_questions
    quiz.status = payload.status
    db.commit()
    db.refresh(quiz)
    return serialize_quiz(quiz, include_correct=True)


@router.post("/{quiz_id}/questions", status_code=status.HTTP_201_CREATED)
def add_question_to_quiz(
    quiz_id: int,
    payload: QuestionCreateUpdate,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    if not payload.options or not any(o.is_correct for o in payload.options):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each MCQ question must have at least one option marked as correct.",
        )

    q = Question(
        quiz_id=quiz.id,
        question_text=payload.question_text.strip(),
        question_type=payload.question_type,
        marks=payload.marks,
        explanation=payload.explanation,
        sort_order=payload.sort_order,
    )
    db.add(q)
    db.flush()

    for idx, opt in enumerate(payload.options, start=1):
        db.add(
            QuizOption(
                question_id=q.id,
                option_text=opt.option_text.strip(),
                is_correct=opt.is_correct,
                sort_order=opt.sort_order or idx,
            )
        )

    db.flush()
    db.refresh(quiz)
    quiz.total_marks = sum(qn.marks for qn in quiz.questions)
    db.commit()
    db.refresh(q)
    return serialize_question(q, include_correct=True)


@router.delete("/questions/{question_id}")
def delete_question(
    question_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")
    quiz_id = q.quiz_id
    db.delete(q)
    db.flush()
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if quiz and quiz.questions:
        quiz.total_marks = sum(qn.marks for qn in quiz.questions)
    db.commit()
    return {"message": "Question deleted."}


@router.post("/{quiz_id}/start")
def start_quiz_attempt(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    now = datetime.now()
    if quiz.available_from and now < quiz.available_from:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This quiz is not open yet. Opens at {quiz.available_from}.",
        )
    if quiz.available_until and now > quiz.available_until:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The availability window for this quiz has closed.",
        )

    # Check if an active un-expired in_progress attempt exists
    active_attempt = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.student_id == current_user.id,
            QuizAttempt.status == "in_progress",
        )
        .first()
    )
    if active_attempt:
        if now <= active_attempt.expires_at:
            return {
                "attempt": serialize_quiz_attempt(active_attempt, include_answers=False),
                "quiz": serialize_quiz(quiz, include_correct=False),
            }
        else:
            active_attempt.status = "timed_out"
            active_attempt.submitted_at = active_attempt.expires_at
            db.flush()

    past_attempts = (
        db.query(QuizAttempt)
        .filter(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.student_id == current_user.id,
        )
        .count()
    )
    if past_attempts >= quiz.max_attempts and not (quiz.allow_retake and past_attempts < quiz.max_attempts):
        if past_attempts >= 1 and not quiz.allow_retake:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already attempted this quiz and retakes are disabled.",
            )
        if past_attempts >= quiz.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Maximum allowed attempts ({quiz.max_attempts}) reached for this quiz.",
            )

    expires = now + timedelta(minutes=quiz.duration_minutes)
    total_marks = sum(q.marks for q in (quiz.questions or [])) or quiz.total_marks

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        student_id=current_user.id,
        attempt_number=past_attempts + 1,
        started_at=now,
        expires_at=expires,
        total_marks=total_marks,
        obtained_marks=0.0,
        percentage=0.0,
        is_passed=False,
        status="in_progress",
    )
    db.add(attempt)
    db.flush()
    db.add(
        QuizAttemptEvent(
            attempt_id=attempt.id,
            event_type="EXAM_STARTED",
            event_data=f"Started at {now.isoformat()}, expires at {expires.isoformat()}",
        )
    )
    db.commit()
    db.refresh(attempt)

    return {
        "attempt": serialize_quiz_attempt(attempt, include_answers=False),
        "quiz": serialize_quiz(quiz, include_correct=False),
    }


@router.post("/attempts/{attempt_id}/submit")
def submit_quiz_attempt(
    attempt_id: int,
    payload: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Critical Security:
    - Calculate scores 100% on the backend from database QuizOption.is_correct.
    - Never trust browser-submitted marks.
    - Enforce server timestamp expiry (with 60-second network grace buffer).
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz attempt not found.")

    if current_user.role_name == "student" and attempt.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this attempt.")

    if attempt.status in ("submitted", "evaluated", "timed_out"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This quiz attempt has already been submitted and graded.",
        )

    quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")

    now = datetime.now()
    grace_expiry = attempt.expires_at + timedelta(seconds=60)
    timed_out = now > grace_expiry

    # Clear any draft answers for this attempt
    db.query(QuizAnswer).filter(QuizAnswer.attempt_id == attempt.id).delete()

    questions_by_id = {q.id: q for q in (quiz.questions or [])}
    total_marks = sum(q.marks for q in questions_by_id.values()) or quiz.total_marks
    obtained_marks = 0.0

    submitted_map = {item.question_id: item.selected_option_id for item in payload.answers}

    for q_id, question in questions_by_id.items():
        selected_opt_id = submitted_map.get(q_id)
        is_correct = False
        marks_awarded = 0.0

        if selected_opt_id is not None:
            matched_opt = next((o for o in question.options if o.id == selected_opt_id), None)
            if matched_opt and matched_opt.is_correct:
                is_correct = True
                marks_awarded = float(question.marks)
                obtained_marks += marks_awarded

        db.add(
            QuizAnswer(
                attempt_id=attempt.id,
                question_id=q_id,
                selected_option_id=selected_opt_id,
                is_correct=is_correct,
                marks_awarded=marks_awarded,
                answered_at=now,
            )
        )

    percentage = round((obtained_marks / total_marks) * 100.0, 1) if total_marks > 0 else 0.0
    is_passed = obtained_marks >= quiz.passing_marks

    attempt.submitted_at = now
    attempt.total_marks = total_marks
    attempt.obtained_marks = obtained_marks
    attempt.percentage = percentage
    attempt.is_passed = is_passed
    attempt.status = "timed_out" if timed_out else "evaluated"

    db.add(
        QuizAttemptEvent(
            attempt_id=attempt.id,
            event_type="EXAM_SUBMITTED",
            event_data=f"Score: {obtained_marks}/{total_marks} ({percentage}%), timed_out={timed_out}",
        )
    )
    db.flush()

    recalculate_student_course_progress(
        db=db, student_id=attempt.student_id, course_id=quiz.course_id
    )
    db.commit()
    db.refresh(attempt)
    return serialize_quiz_attempt(attempt, include_answers=True)


@router.delete("/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found.")
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully."}
