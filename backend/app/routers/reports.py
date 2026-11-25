"""Reports, Analytics, Dashboard KPIs, and CSV/Excel/PDF Exports router."""
from datetime import date
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.batch import Batch, BatchStudent
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture, LectureProgress
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.role import Role
from app.models.submission import Submission
from app.models.user import User
from app.services.lms_service import (
    calculate_attendance_stats,
    recalculate_student_course_progress,
)
from app.utils.export_utils import export_dataset
from app.utils.serializers import (
    serialize_batch,
    serialize_course,
    serialize_enrollment,
    serialize_lecture,
    serialize_notification,
    serialize_payment,
    serialize_quiz_attempt,
    serialize_submission,
    serialize_user,
)

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.get("/dashboard")
def get_role_dashboard_kpis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unified, 100% database-driven dashboard metrics & chart series for Admin, Instructor, and Student."""
    role = current_user.role_name

    if role == "admin":
        total_students = (
            db.query(func.count(User.id))
            .join(Role)
            .filter(Role.name == "student", User.is_deleted == False)
            .scalar()
            or 0
        )
        total_instructors = (
            db.query(func.count(User.id))
            .join(Role)
            .filter(Role.name == "instructor", User.is_deleted == False)
            .scalar()
            or 0
        )
        total_courses = (
            db.query(func.count(Course.id)).filter(Course.is_deleted == False).scalar() or 0
        )
        total_batches = db.query(func.count(Batch.id)).scalar() or 0
        active_batches = (
            db.query(func.count(Batch.id)).filter(Batch.status == "active").scalar() or 0
        )
        total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0

        payments = db.query(Payment).all()
        total_revenue = float(
            sum(p.paid_amount for p in payments if p.status in ("paid", "partially_paid"))
        )
        pending_fees = float(
            sum(p.pending_amount for p in payments if p.status in ("pending", "partially_paid"))
        )
        pending_evaluations = (
            db.query(func.count(Submission.id))
            .filter(Submission.status.in_(["submitted", "late_submission", "under_review"]))
            .scalar()
            or 0
        )

        recent_registrations = (
            db.query(User)
            .filter(User.is_deleted == False)
            .order_by(User.created_at.desc())
            .limit(6)
            .all()
        )

        # Course-wise performance & enrollment analytics
        courses = db.query(Course).filter(Course.is_deleted == False).all()
        course_performance = []
        for c in courses:
            c_enr = db.query(Enrollment).filter(Enrollment.course_id == c.id).all()
            c_pay = db.query(Payment).filter(Payment.course_id == c.id).all()
            avg_comp = (
                round(sum(e.completion_percentage for e in c_enr) / len(c_enr), 1)
                if c_enr
                else 0.0
            )
            rev = float(sum(p.paid_amount for p in c_pay))
            course_performance.append(
                {
                    "course_id": c.id,
                    "course_code": c.course_code,
                    "title": c.title[:26],
                    "students": len(c_enr),
                    "avg_completion": avg_comp,
                    "revenue": rev,
                }
            )

        # Batch-wise statistics
        batches = db.query(Batch).all()
        batch_stats = []
        for b in batches:
            att = calculate_attendance_stats(db, batch_id=b.id)
            active_stu = len([bs for bs in (b.batch_students or []) if bs.status == "active"])
            batch_stats.append(
                {
                    "batch_id": b.id,
                    "name": b.name[:24],
                    "course_title": b.course.title if b.course else "",
                    "enrolled": active_stu,
                    "capacity": b.capacity,
                    "attendance_pct": att["attendance_percentage"],
                    "status": b.status,
                }
            )

        # Monthly Revenue & Enrollment Trend from actual payment & enrollment records
        month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        rev_by_month = {m: 0.0 for m in range(1, 13)}
        enr_by_month = {m: 0 for m in range(1, 13)}
        for p in payments:
            if p.payment_date:
                rev_by_month[p.payment_date.month] += float(p.paid_amount)
        all_enrollments = db.query(Enrollment).all()
        for e in all_enrollments:
            if e.enrolled_at:
                enr_by_month[e.enrolled_at.month] += 1

        revenue_analytics = [
            {
                "month": month_labels[m - 1],
                "revenue": round(rev_by_month[m], 2),
                "enrollments": enr_by_month[m],
            }
            for m in range(1, 13)
            if rev_by_month[m] > 0 or enr_by_month[m] > 0 or m >= 6
        ]

        return {
            "role": "admin",
            "kpis": {
                "total_students": total_students,
                "total_instructors": total_instructors,
                "total_courses": total_courses,
                "total_batches": total_batches,
                "active_batches": active_batches,
                "total_enrollments": total_enrollments,
                "total_revenue": total_revenue,
                "pending_fees": pending_fees,
                "pending_evaluations": pending_evaluations,
            },
            "recent_registrations": [serialize_user(u) for u in recent_registrations],
            "course_performance": course_performance,
            "batch_statistics": batch_stats,
            "revenue_analytics": revenue_analytics,
        }

    elif role == "instructor":
        assigned_courses = (
            db.query(Course)
            .filter(Course.instructor_id == current_user.id, Course.is_deleted == False)
            .all()
        )
        course_ids = [c.id for c in assigned_courses]
        assigned_batches = (
            db.query(Batch).filter(Batch.instructor_id == current_user.id).all()
        )
        batch_ids = [b.id for b in assigned_batches]

        enrollments = (
            db.query(Enrollment)
            .filter(Enrollment.course_id.in_(course_ids or [-1]))
            .all()
        )
        unique_student_ids = {e.student_id for e in enrollments}

        upcoming_lectures = (
            db.query(Lecture)
            .filter(Lecture.course_id.in_(course_ids or [-1]))
            .order_by(Lecture.sort_order.asc())
            .limit(6)
            .all()
        )

        recent_submissions = (
            db.query(Submission)
            .join(Assignment)
            .filter(Assignment.course_id.in_(course_ids or [-1]))
            .order_by(Submission.submitted_at.desc())
            .limit(8)
            .all()
        )
        pending_evaluations = sum(
            1 for s in recent_submissions if s.status in ("submitted", "late_submission", "under_review")
        )

        quiz_attempts = (
            db.query(QuizAttempt)
            .join(Quiz)
            .filter(Quiz.course_id.in_(course_ids or [-1]))
            .all()
        )
        avg_quiz_score = (
            round(sum(a.percentage for a in quiz_attempts) / len(quiz_attempts), 1)
            if quiz_attempts
            else 0.0
        )

        attendance_overview = []
        for b in assigned_batches:
            att = calculate_attendance_stats(db, batch_id=b.id)
            attendance_overview.append(
                {
                    "batch_id": b.id,
                    "batch_name": b.name,
                    "attendance_percentage": att["attendance_percentage"],
                    "present_classes": att["present_classes"],
                    "absent_classes": att["absent_classes"],
                }
            )

        student_performance = []
        for c in assigned_courses:
            c_enr = [e for e in enrollments if e.course_id == c.id]
            avg_prog = (
                round(sum(e.completion_percentage for e in c_enr) / len(c_enr), 1)
                if c_enr
                else 0.0
            )
            student_performance.append(
                {
                    "course_title": c.title[:25],
                    "students": len(c_enr),
                    "avg_progress": avg_prog,
                }
            )

        return {
            "role": "instructor",
            "kpis": {
                "assigned_courses": len(assigned_courses),
                "assigned_batches": len(assigned_batches),
                "total_students": len(unique_student_ids),
                "upcoming_lectures": len(upcoming_lectures),
                "pending_evaluations": pending_evaluations,
                "avg_quiz_score": avg_quiz_score,
            },
            "courses": [serialize_course(c, enrollments_count=len([e for e in enrollments if e.course_id == c.id])) for c in assigned_courses],
            "batches": [serialize_batch(b) for b in assigned_batches],
            "upcoming_lectures": [serialize_lecture(l) for l in upcoming_lectures],
            "recent_submissions": [serialize_submission(s) for s in recent_submissions],
            "attendance_overview": attendance_overview,
            "student_performance": student_performance,
        }

    else:
        # Student dashboard
        enrollments = (
            db.query(Enrollment)
            .filter(Enrollment.student_id == current_user.id)
            .all()
        )
        course_ids = [e.course_id for e in enrollments]
        active_batches_count = len({e.batch_id for e in enrollments if e.batch_id})

        for e in enrollments:
            recalculate_student_course_progress(db, student_id=current_user.id, course_id=e.course_id)
        db.commit()

        completed_lectures = (
            db.query(func.count(LectureProgress.id))
            .filter(
                LectureProgress.student_id == current_user.id,
                LectureProgress.is_completed == True,
            )
            .scalar()
            or 0
        )

        all_assignments = (
            db.query(Assignment)
            .filter(
                Assignment.course_id.in_(course_ids or [-1]),
                Assignment.status == "published",
            )
            .all()
        )
        submitted_assignment_ids = {
            s[0]
            for s in db.query(Submission.assignment_id)
            .filter(Submission.student_id == current_user.id)
            .all()
        }
        pending_assignments = [
            a for a in all_assignments if a.id not in submitted_assignment_ids
        ]

        available_quizzes = (
            db.query(Quiz)
            .filter(
                Quiz.course_id.in_(course_ids or [-1]),
                Quiz.status == "published",
            )
            .all()
        )
        my_quiz_attempts = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.student_id == current_user.id)
            .order_by(QuizAttempt.created_at.desc())
            .all()
        )
        attempted_quiz_ids = {a.quiz_id for a in my_quiz_attempts}
        upcoming_quizzes = [q for q in available_quizzes if q.id not in attempted_quiz_ids]

        att_stats = calculate_attendance_stats(db, student_id=current_user.id)
        overall_completion = (
            round(sum(e.completion_percentage for e in enrollments) / len(enrollments), 1)
            if enrollments
            else 0.0
        )

        recent_notifs = (
            db.query(Notification)
            .filter(
                (Notification.user_id == current_user.id)
                | (Notification.role_target.in_(["student", "all"]))
            )
            .order_by(Notification.created_at.desc())
            .limit(6)
            .all()
        )

        return {
            "role": "student",
            "kpis": {
                "enrolled_courses": len(enrollments),
                "active_batches": active_batches_count,
                "completed_lectures": completed_lectures,
                "pending_assignments": len(pending_assignments),
                "upcoming_quizzes": len(upcoming_quizzes),
                "attendance_percentage": att_stats["attendance_percentage"],
                "completion_percentage": overall_completion,
            },
            "enrollments": [serialize_enrollment(e) for e in enrollments],
            "recent_results": [serialize_quiz_attempt(a, include_answers=False) for a in my_quiz_attempts[:5]],
            "recent_notifications": [serialize_notification(n) for n in recent_notifs],
            "attendance_summary": att_stats,
        }


@router.get("/analytics")
def get_detailed_reports(
    report_type: str = Query(default="enrollment"),
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    search: Optional[str] = Query(default=None),
    export: Optional[str] = Query(default=None),  # csv, xlsx, pdf
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Comprehensive database-driven reporting engine with filtering and CSV/Excel/PDF exports.
    Supported report_type values:
    - enrollment
    - course_performance
    - batch_performance
    - instructor_activity
    - attendance
    - assignments
    - quizzes
    - revenue
    - pending_fees
    """
    rtype = report_type.lower().strip()
    rows: List[Dict[str, Any]] = []
    title = "NexusLMS Report"

    if rtype == "enrollment":
        title = "Student Enrollment & Course Progress Report"
        q = db.query(Enrollment)
        if current_user.role_name == "student":
            q = q.filter(Enrollment.student_id == current_user.id)
        if course_id:
            q = q.filter(Enrollment.course_id == course_id)
        if batch_id:
            q = q.filter(Enrollment.batch_id == batch_id)
        for e in q.order_by(Enrollment.enrolled_at.desc()).all():
            row = {
                "Enrollment #": e.enrollment_number,
                "Student Name": e.student.full_name if e.student else "",
                "Student Email": e.student.email if e.student else "",
                "Course": e.course.title if e.course else "",
                "Batch": e.batch.name if e.batch else "Direct",
                "Completion %": round(e.completion_percentage, 1),
                "Status": e.status.upper(),
                "Enrolled Date": e.enrolled_at.strftime("%Y-%m-%d") if e.enrolled_at else "",
            }
            if search and search.lower() not in str(row.values()).lower():
                continue
            rows.append(row)

    elif rtype in ("revenue", "pending_fees"):
        title = "Pending Fee Report" if rtype == "pending_fees" else "Institute Revenue & Fee Collection Report"
        q = db.query(Payment)
        if current_user.role_name == "student":
            q = q.filter(Payment.student_id == current_user.id)
        if course_id:
            q = q.filter(Payment.course_id == course_id)
        if start_date:
            q = q.filter(Payment.payment_date >= start_date)
        if end_date:
            q = q.filter(Payment.payment_date <= end_date)
        if rtype == "pending_fees":
            q = q.filter(Payment.pending_amount > 0)
        for p in q.order_by(Payment.payment_date.desc()).all():
            row = {
                "Invoice #": p.invoice_number,
                "Student": p.student.full_name if p.student else "",
                "Course": p.course.title if p.course else "",
                "Total Fee ($)": float(p.total_fee),
                "Paid Amount ($)": float(p.paid_amount),
                "Pending ($)": float(p.pending_amount),
                "Method": p.payment_method.upper(),
                "Transaction Ref": p.transaction_reference or "",
                "Status": p.status.upper(),
                "Date": p.payment_date.isoformat() if p.payment_date else "",
            }
            if search and search.lower() not in str(row.values()).lower():
                continue
            rows.append(row)

    elif rtype == "attendance":
        title = "Student Attendance & Eligibility Report"
        q = db.query(Attendance)
        if current_user.role_name == "student":
            q = q.filter(Attendance.student_id == current_user.id)
        if course_id:
            q = q.filter(Attendance.course_id == course_id)
        if batch_id:
            q = q.filter(Attendance.batch_id == batch_id)
        if start_date:
            q = q.filter(Attendance.attendance_date >= start_date)
        if end_date:
            q = q.filter(Attendance.attendance_date <= end_date)
        for a in q.order_by(Attendance.attendance_date.desc()).all():
            row = {
                "Date": a.attendance_date.isoformat() if a.attendance_date else "",
                "Batch": a.batch.name if a.batch else "",
                "Course": a.course.title if a.course else "",
                "Student": a.student.full_name if a.student else "",
                "Session Type": a.session_status.upper(),
                "Attendance Status": a.status.upper(),
                "Remarks": a.remarks or "",
            }
            if search and search.lower() not in str(row.values()).lower():
                continue
            rows.append(row)

    elif rtype == "assignments":
        title = "Assignment Submissions & Evaluation Report"
        q = db.query(Submission).join(Assignment)
        if current_user.role_name == "student":
            q = q.filter(Submission.student_id == current_user.id)
        if course_id:
            q = q.filter(Assignment.course_id == course_id)
        for s in q.order_by(Submission.submitted_at.desc()).all():
            row = {
                "Assignment": s.assignment.title if s.assignment else "",
                "Course": (s.assignment.course.title if s.assignment and s.assignment.course else ""),
                "Student": s.student.full_name if s.student else "",
                "Submitted At": s.submitted_at.strftime("%Y-%m-%d %H:%M") if s.submitted_at else "",
                "Late": "YES" if s.is_late else "NO",
                "Marks Awarded": s.marks_obtained if s.marks_obtained is not None else "Pending",
                "Max Marks": s.assignment.max_marks if s.assignment else 100,
                "Status": s.status.upper(),
            }
            if search and search.lower() not in str(row.values()).lower():
                continue
            rows.append(row)

    elif rtype == "quizzes":
        title = "Quiz & Examination Performance Report"
        q = db.query(QuizAttempt).join(Quiz)
        if current_user.role_name == "student":
            q = q.filter(QuizAttempt.student_id == current_user.id)
        if course_id:
            q = q.filter(Quiz.course_id == course_id)
        for qa in q.order_by(QuizAttempt.created_at.desc()).all():
            row = {
                "Quiz Title": qa.quiz.title if qa.quiz else "",
                "Course": (qa.quiz.course.title if qa.quiz and qa.quiz.course else ""),
                "Student": qa.student.full_name if qa.student else "",
                "Attempt #": qa.attempt_number,
                "Score": qa.obtained_marks,
                "Total Marks": qa.total_marks,
                "Percentage %": round(qa.percentage, 1),
                "Result": "PASSED" if qa.is_passed else "FAILED",
                "Status": qa.status.upper(),
            }
            if search and search.lower() not in str(row.values()).lower():
                continue
            rows.append(row)

    else:
        # Course & Batch performance summary
        title = "Course & Batch Performance Report"
        courses = db.query(Course).filter(Course.is_deleted == False).all()
        for c in courses:
            if course_id and c.id != course_id:
                continue
            enrs = db.query(Enrollment).filter(Enrollment.course_id == c.id).all()
            avg_comp = round(sum(e.completion_percentage for e in enrs) / len(enrs), 1) if enrs else 0.0
            certs = db.query(func.count(Certificate.id)).filter(Certificate.course_id == c.id).scalar() or 0
            rows.append(
                {
                    "Course Code": c.course_code,
                    "Course Title": c.title,
                    "Category": c.category.name if c.category else "",
                    "Instructor": c.instructor.full_name if c.instructor else "Unassigned",
                    "Enrolled Students": len(enrs),
                    "Avg Completion %": avg_comp,
                    "Certificates Issued": certs,
                    "Status": c.status.upper(),
                }
            )

    if export in ("csv", "xlsx", "excel", "pdf"):
        return export_dataset(
            title=title,
            records=rows,
            export_format=export,
            filename_prefix=f"nexuslms_{rtype}_report",
        )

    return {
        "title": title,
        "report_type": rtype,
        "items": rows,
        "total": len(rows),
    }
