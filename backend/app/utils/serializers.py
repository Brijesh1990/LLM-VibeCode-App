"""Clean model-to-dict serializers for FastAPI REST responses."""
from typing import Any, Dict, Optional
from app.models.announcement import Announcement
from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.batch import Batch, BatchStudent
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.course_category import CourseCategory
from app.models.course_module import CourseModule
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.study_material import StudyMaterial
from app.models.submission import Submission
from app.models.user import User


def serialize_user(u: User) -> Dict[str, Any]:
    prof = u.instructor_profile
    return {
        "id": u.id,
        "role_id": u.role_id,
        "role": u.role_name,
        "full_name": u.full_name,
        "email": u.email,
        "phone": u.phone or "",
        "avatar_url": u.avatar_url or "",
        "bio": u.bio or "",
        "address": u.address or "",
        "student_code": u.student_code or f"STU-{u.id:04d}",
        "is_active": u.is_active,
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "employee_code": prof.employee_code if prof else f"INS-{u.id:03d}",
        "department": prof.department if prof else "",
        "designation": prof.designation if prof else "",
        "qualification": prof.qualification if prof else "",
        "specialization": prof.specialization if prof else "",
        "experience_years": prof.experience_years if prof else 0,
        "joining_date": prof.joining_date.isoformat() if (prof and prof.joining_date) else None,
    }


def serialize_category(c: CourseCategory, courses_count: int = 0) -> Dict[str, Any]:
    return {
        "id": c.id,
        "name": c.name,
        "slug": c.slug,
        "description": c.description or "",
        "icon": c.icon or "BookOpen",
        "is_active": c.is_active,
        "courses_count": courses_count,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def serialize_module(m: CourseModule) -> Dict[str, Any]:
    return {
        "id": m.id,
        "course_id": m.course_id,
        "course_title": m.course.title if m.course else "",
        "title": m.title,
        "description": m.description or "",
        "sort_order": m.sort_order,
        "is_published": m.is_published,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


def serialize_course(
    c: Course,
    enrollments_count: int = 0,
    lectures_count: int = 0,
    batches_count: int = 0,
) -> Dict[str, Any]:
    return {
        "id": c.id,
        "course_code": c.course_code,
        "title": c.title,
        "slug": c.slug,
        "category_id": c.category_id,
        "category_name": c.category.name if c.category else "General",
        "instructor_id": c.instructor_id,
        "instructor_name": c.instructor.full_name if c.instructor else "Unassigned",
        "description": c.description,
        "duration_weeks": c.duration_weeks,
        "duration_hours": c.duration_hours,
        "fee": float(c.fee),
        "thumbnail_url": c.thumbnail_url or "",
        "level": c.level,
        "status": c.status,
        "completion_threshold_pct": c.completion_threshold_pct,
        "enrollments_count": enrollments_count,
        "lectures_count": lectures_count,
        "batches_count": batches_count,
        "modules": [serialize_module(m) for m in (c.modules or [])],
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


def serialize_batch(b: Batch) -> Dict[str, Any]:
    active_students = [bs for bs in (b.batch_students or []) if bs.status == "active"]
    return {
        "id": b.id,
        "batch_code": b.batch_code,
        "name": b.name,
        "course_id": b.course_id,
        "course_title": b.course.title if b.course else "",
        "instructor_id": b.instructor_id,
        "instructor_name": b.instructor.full_name if b.instructor else "Unassigned",
        "start_date": b.start_date.isoformat() if b.start_date else None,
        "end_date": b.end_date.isoformat() if b.end_date else None,
        "class_days": b.class_days,
        "class_timing": b.class_timing,
        "capacity": b.capacity,
        "enrolled_count": len(active_students),
        "available_seats": max(0, b.capacity - len(active_students)),
        "status": b.status,
        "students": [
            {
                "id": bs.student.id,
                "full_name": bs.student.full_name,
                "email": bs.student.email,
                "student_code": bs.student.student_code or f"STU-{bs.student.id:04d}",
                "joined_at": bs.joined_at.isoformat() if bs.joined_at else None,
            }
            for bs in active_students
            if bs.student
        ],
        "created_at": b.created_at.isoformat() if b.created_at else None,
    }


def serialize_enrollment(e: Enrollment) -> Dict[str, Any]:
    return {
        "id": e.id,
        "enrollment_number": e.enrollment_number,
        "student_id": e.student_id,
        "student_name": e.student.full_name if e.student else "",
        "student_email": e.student.email if e.student else "",
        "student_code": (e.student.student_code or f"STU-{e.student.id:04d}") if e.student else "",
        "course_id": e.course_id,
        "course_title": e.course.title if e.course else "",
        "course_code": e.course.course_code if e.course else "",
        "course_fee": float(e.course.fee) if e.course else 0.0,
        "instructor_name": (e.course.instructor.full_name if e.course and e.course.instructor else "Unassigned"),
        "batch_id": e.batch_id,
        "batch_name": e.batch.name if e.batch else "Self-Paced / Direct",
        "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
        "status": e.status,
        "completion_percentage": round(e.completion_percentage, 1),
        "completed_at": e.completed_at.isoformat() if e.completed_at else None,
    }


def serialize_lecture(l: Lecture, is_completed: bool = False) -> Dict[str, Any]:
    return {
        "id": l.id,
        "course_id": l.course_id,
        "course_title": l.course.title if l.course else "",
        "module_id": l.module_id,
        "module_title": l.module.title if l.module else "General Module",
        "batch_id": l.batch_id,
        "batch_name": l.batch.name if l.batch else "All Batches",
        "title": l.title,
        "description": l.description or "",
        "video_url": l.video_url or "",
        "video_file_path": l.video_file_path or "",
        "duration_minutes": l.duration_minutes,
        "sort_order": l.sort_order,
        "scheduled_at": l.scheduled_at.isoformat() if l.scheduled_at else None,
        "is_published": l.is_published,
        "is_completed": is_completed,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }


def serialize_material(m: StudyMaterial) -> Dict[str, Any]:
    return {
        "id": m.id,
        "course_id": m.course_id,
        "course_title": m.course.title if m.course else "",
        "module_id": m.module_id,
        "module_title": m.module.title if m.module else "",
        "batch_id": m.batch_id,
        "batch_name": m.batch.name if m.batch else "All Batches",
        "lecture_id": m.lecture_id,
        "lecture_title": m.lecture.title if m.lecture else "",
        "title": m.title,
        "description": m.description or "",
        "file_name": m.file_name,
        "file_path": m.file_path,
        "file_type": m.file_type,
        "file_size_bytes": m.file_size_bytes,
        "uploaded_by": m.uploaded_by,
        "uploader_name": m.uploader.full_name if m.uploader else "Instructor",
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


def serialize_assignment(a: Assignment, submissions_count: int = 0, my_submission: Optional[Dict] = None) -> Dict[str, Any]:
    return {
        "id": a.id,
        "course_id": a.course_id,
        "course_title": a.course.title if a.course else "",
        "batch_id": a.batch_id,
        "batch_name": a.batch.name if a.batch else "All Batches",
        "module_id": a.module_id,
        "module_title": a.module.title if a.module else "",
        "title": a.title,
        "description": a.description,
        "instructions": a.instructions or "",
        "reference_file_path": a.reference_file_path or "",
        "max_marks": a.max_marks,
        "passing_marks": a.passing_marks,
        "due_date": a.due_date.isoformat() if a.due_date else None,
        "allow_late_submission": a.allow_late_submission,
        "status": a.status,
        "submissions_count": submissions_count,
        "my_submission": my_submission,
        "created_by": a.created_by,
        "creator_name": a.creator.full_name if a.creator else "Instructor",
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


def serialize_submission(s: Submission) -> Dict[str, Any]:
    latest_fb = s.feedback_items[-1] if s.feedback_items else None
    return {
        "id": s.id,
        "assignment_id": s.assignment_id,
        "assignment_title": s.assignment.title if s.assignment else "",
        "course_id": s.assignment.course_id if s.assignment else None,
        "course_title": (s.assignment.course.title if s.assignment and s.assignment.course else ""),
        "max_marks": s.assignment.max_marks if s.assignment else 100.0,
        "student_id": s.student_id,
        "student_name": s.student.full_name if s.student else "",
        "student_email": s.student.email if s.student else "",
        "submission_text": s.submission_text or "",
        "file_path": s.file_path or "",
        "file_name": s.file_name or "",
        "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        "is_late": s.is_late,
        "status": s.status,
        "marks_obtained": s.marks_obtained,
        "evaluated_by": s.evaluated_by,
        "evaluator_name": s.evaluator.full_name if s.evaluator else "",
        "evaluated_at": s.evaluated_at.isoformat() if s.evaluated_at else None,
        "feedback_text": latest_fb.feedback_text if latest_fb else "",
        "rubric_notes": latest_fb.rubric_notes if latest_fb else "",
        "feedback_history": [
            {
                "id": fb.id,
                "feedback_text": fb.feedback_text,
                "rubric_notes": fb.rubric_notes or "",
                "instructor_name": fb.instructor.full_name if fb.instructor else "Instructor",
                "created_at": fb.created_at.isoformat() if fb.created_at else None,
            }
            for fb in (s.feedback_items or [])
        ],
    }


def serialize_question(q: Question, include_correct: bool = False) -> Dict[str, Any]:
    return {
        "id": q.id,
        "quiz_id": q.quiz_id,
        "question_text": q.question_text,
        "question_type": q.question_type,
        "marks": q.marks,
        "explanation": q.explanation if include_correct else "",
        "sort_order": q.sort_order,
        "options": [
            {
                "id": opt.id,
                "option_text": opt.option_text,
                "sort_order": opt.sort_order,
                **({"is_correct": opt.is_correct} if include_correct else {}),
            }
            for opt in (q.options or [])
        ],
    }


def serialize_quiz(q: Quiz, include_correct: bool = False, attempts_count: int = 0) -> Dict[str, Any]:
    return {
        "id": q.id,
        "course_id": q.course_id,
        "course_title": q.course.title if q.course else "",
        "batch_id": q.batch_id,
        "batch_name": q.batch.name if q.batch else "All Batches",
        "module_id": q.module_id,
        "title": q.title,
        "description": q.description or "",
        "instructions": q.instructions or "",
        "total_marks": q.total_marks,
        "passing_marks": q.passing_marks,
        "duration_minutes": q.duration_minutes,
        "available_from": q.available_from.isoformat() if q.available_from else None,
        "available_until": q.available_until.isoformat() if q.available_until else None,
        "max_attempts": q.max_attempts,
        "allow_retake": q.allow_retake,
        "shuffle_questions": q.shuffle_questions,
        "status": q.status,
        "questions_count": len(q.questions or []),
        "attempts_count": attempts_count,
        "questions": [serialize_question(qn, include_correct=include_correct) for qn in (q.questions or [])],
        "created_at": q.created_at.isoformat() if q.created_at else None,
    }


def serialize_quiz_attempt(a: QuizAttempt, include_answers: bool = True) -> Dict[str, Any]:
    is_finished = a.status in ("submitted", "evaluated", "timed_out")
    return {
        "id": a.id,
        "quiz_id": a.quiz_id,
        "quiz_title": a.quiz.title if a.quiz else "",
        "course_id": a.quiz.course_id if a.quiz else None,
        "course_title": (a.quiz.course.title if a.quiz and a.quiz.course else ""),
        "student_id": a.student_id,
        "student_name": a.student.full_name if a.student else "",
        "student_email": a.student.email if a.student else "",
        "attempt_number": a.attempt_number,
        "started_at": a.started_at.isoformat() if a.started_at else None,
        "expires_at": a.expires_at.isoformat() if a.expires_at else None,
        "submitted_at": a.submitted_at.isoformat() if a.submitted_at else None,
        "total_marks": a.total_marks,
        "obtained_marks": a.obtained_marks,
        "percentage": round(a.percentage, 1),
        "is_passed": a.is_passed,
        "status": a.status,
        "answers": [
            {
                "id": ans.id,
                "question_id": ans.question_id,
                "question_text": ans.question.question_text if ans.question else "",
                "selected_option_id": ans.selected_option_id,
                "selected_option_text": ans.selected_option.option_text if ans.selected_option else "Unanswered",
                "is_correct": ans.is_correct if is_finished else None,
                "marks_awarded": ans.marks_awarded if is_finished else None,
            }
            for ans in (a.answers or [])
        ]
        if include_answers
        else [],
    }


def serialize_attendance(a: Attendance) -> Dict[str, Any]:
    return {
        "id": a.id,
        "batch_id": a.batch_id,
        "batch_name": a.batch.name if a.batch else "",
        "course_id": a.course_id,
        "course_title": a.course.title if a.course else "",
        "student_id": a.student_id,
        "student_name": a.student.full_name if a.student else "",
        "student_code": (a.student.student_code or f"STU-{a.student.id:04d}") if a.student else "",
        "attendance_date": a.attendance_date.isoformat() if a.attendance_date else None,
        "session_status": a.session_status,
        "status": a.status,
        "remarks": a.remarks or "",
        "marked_by": a.marked_by,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None,
    }


def serialize_certificate(c: Certificate) -> Dict[str, Any]:
    return {
        "id": c.id,
        "certificate_number": c.certificate_number,
        "verification_code": c.verification_code,
        "student_id": c.student_id,
        "student_name": c.student.full_name if c.student else "",
        "student_email": c.student.email if c.student else "",
        "course_id": c.course_id,
        "course_title": c.course.title if c.course else "",
        "course_code": c.course.course_code if c.course else "",
        "batch_id": c.batch_id,
        "batch_name": c.batch.name if c.batch else "",
        "issue_date": c.issue_date.isoformat() if c.issue_date else None,
        "completion_date": c.completion_date.isoformat() if c.completion_date else None,
        "grade": c.grade,
        "final_percentage": round(c.final_percentage, 1),
        "pdf_file_path": c.pdf_file_path or "",
        "is_revoked": c.is_revoked,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def serialize_payment(p: Payment) -> Dict[str, Any]:
    latest_rcp = p.receipts[-1] if p.receipts else None
    return {
        "id": p.id,
        "invoice_number": p.invoice_number,
        "student_id": p.student_id,
        "student_name": p.student.full_name if p.student else "",
        "student_email": p.student.email if p.student else "",
        "course_id": p.course_id,
        "course_title": p.course.title if p.course else "",
        "enrollment_id": p.enrollment_id,
        "total_fee": float(p.total_fee),
        "paid_amount": float(p.paid_amount),
        "pending_amount": float(p.pending_amount),
        "payment_date": p.payment_date.isoformat() if p.payment_date else None,
        "payment_method": p.payment_method,
        "transaction_reference": p.transaction_reference or "",
        "status": p.status,
        "notes": p.notes or "",
        "receipt_number": latest_rcp.receipt_number if latest_rcp else f"RCP-{p.id:04d}",
        "receipt_pdf_url": latest_rcp.pdf_file_path if latest_rcp else "",
        "receipts": [
            {
                "id": r.id,
                "receipt_number": r.receipt_number,
                "amount": float(r.amount),
                "pdf_file_path": r.pdf_file_path or "",
                "generated_at": r.generated_at.isoformat() if r.generated_at else None,
            }
            for r in (p.receipts or [])
        ],
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def serialize_notification(n: Notification) -> Dict[str, Any]:
    return {
        "id": n.id,
        "user_id": n.user_id,
        "role_target": n.role_target or "all",
        "title": n.title,
        "message": n.message,
        "notification_type": n.notification_type,
        "reference_type": n.reference_type or "",
        "reference_id": n.reference_id,
        "is_read": n.is_read,
        "read_at": n.read_at.isoformat() if n.read_at else None,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def serialize_announcement(a: Announcement) -> Dict[str, Any]:
    return {
        "id": a.id,
        "title": a.title,
        "content": a.content,
        "target_role": a.target_role,
        "course_id": a.course_id,
        "course_title": a.course.title if a.course else "Institute-Wide",
        "batch_id": a.batch_id,
        "batch_name": a.batch.name if a.batch else "All Batches",
        "is_pinned": a.is_pinned,
        "is_active": a.is_active,
        "published_by": a.published_by,
        "author_name": a.author.full_name if a.author else "Administration",
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
