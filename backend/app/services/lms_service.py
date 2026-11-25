"""Core LMS service-layer business logic: audit logging, notifications, attendance formula, progress calculation, certificate generation, and fee receipts."""
from datetime import date, datetime
from decimal import Decimal
import json
from typing import Any, Dict, Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.certificate import Certificate
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture, LectureProgress
from app.models.notification import Notification
from app.models.payment import Payment, PaymentReceipt
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.submission import Submission
from app.models.user import AuditLog, User
from app.utils.pdf_generator import generate_certificate_pdf, generate_payment_receipt_pdf


def log_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=json.dumps(old_values, default=str) if old_values else None,
        new_values=json.dumps(new_values, default=str) if new_values else None,
        ip_address=ip_address,
    )
    db.add(entry)
    return entry


def create_notification(
    db: Session,
    title: str,
    message: str,
    notification_type: str = "general",
    user_id: Optional[int] = None,
    role_target: Optional[str] = None,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        role_target=role_target,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_type=reference_type,
        reference_id=reference_id,
        is_read=False,
    )
    db.add(notif)
    return notif


def calculate_attendance_stats(
    db: Session,
    student_id: Optional[int] = None,
    batch_id: Optional[int] = None,
    course_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Calculate Attendance Percentage = (Present Classes / Total Eligible Classes) * 100
    Policy:
    - Sessions with session_status in ('holiday', 'cancelled') are excluded from eligible classes.
    - Records with status == 'approved_leave' are recorded for audit but excluded from the eligible penalty denominator.
    - 'present' and 'late' count as Present Classes.
    """
    query = db.query(Attendance)
    if student_id is not None:
        query = query.filter(Attendance.student_id == student_id)
    if batch_id is not None:
        query = query.filter(Attendance.batch_id == batch_id)
    if course_id is not None:
        query = query.filter(Attendance.course_id == course_id)

    records = query.all()
    total_recorded = len(records)
    holidays_or_cancelled = sum(1 for r in records if r.session_status in ("holiday", "cancelled"))
    approved_leaves = sum(
        1 for r in records if r.session_status == "scheduled" and r.status == "approved_leave"
    )
    present_classes = sum(
        1 for r in records if r.session_status == "scheduled" and r.status in ("present", "late")
    )
    absent_classes = sum(
        1 for r in records if r.session_status == "scheduled" and r.status == "absent"
    )
    eligible_classes = present_classes + absent_classes

    percentage = round((present_classes / eligible_classes) * 100.0, 1) if eligible_classes > 0 else 100.0
    return {
        "total_sessions": total_recorded,
        "eligible_classes": eligible_classes,
        "present_classes": present_classes,
        "absent_classes": absent_classes,
        "approved_leaves": approved_leaves,
        "holidays_or_cancelled": holidays_or_cancelled,
        "attendance_percentage": percentage,
    }


def recalculate_student_course_progress(
    db: Session,
    student_id: int,
    course_id: int,
) -> Dict[str, Any]:
    """
    Calculate real database-driven course completion percentage:
    Weighted formula across active components in the course:
    - Lectures completed (weight 50%)
    - Assignments submitted/evaluated (weight 30%)
    - Quizzes attempted/passed (weight 20%)
    If a course has no assignments or quizzes yet, weights normalize proportionally across existing components.
    """
    total_lectures = (
        db.query(func.count(Lecture.id))
        .filter(Lecture.course_id == course_id, Lecture.is_published == True)
        .scalar()
        or 0
    )
    completed_lectures = (
        db.query(func.count(LectureProgress.id))
        .filter(
            LectureProgress.student_id == student_id,
            LectureProgress.course_id == course_id,
            LectureProgress.is_completed == True,
        )
        .scalar()
        or 0
    )
    completed_lectures = min(completed_lectures, total_lectures)

    total_assignments = (
        db.query(func.count(Assignment.id))
        .filter(Assignment.course_id == course_id, Assignment.status == "published")
        .scalar()
        or 0
    )
    assignment_ids = [
        a[0]
        for a in db.query(Assignment.id)
        .filter(Assignment.course_id == course_id, Assignment.status == "published")
        .all()
    ]
    submitted_assignments = 0
    avg_assignment_score = 0.0
    if assignment_ids:
        subs = (
            db.query(Submission)
            .filter(
                Submission.student_id == student_id,
                Submission.assignment_id.in_(assignment_ids),
            )
            .all()
        )
        submitted_assignments = len(subs)
        evaluated_subs = [s for s in subs if s.marks_obtained is not None and s.assignment]
        if evaluated_subs:
            avg_assignment_score = round(
                sum((s.marks_obtained / max(s.assignment.max_marks, 1.0)) * 100.0 for s in evaluated_subs)
                / len(evaluated_subs),
                1,
            )

    total_quizzes = (
        db.query(func.count(Quiz.id))
        .filter(Quiz.course_id == course_id, Quiz.status == "published")
        .scalar()
        or 0
    )
    quiz_ids = [
        q[0]
        for q in db.query(Quiz.id)
        .filter(Quiz.course_id == course_id, Quiz.status == "published")
        .all()
    ]
    completed_quizzes = 0
    avg_quiz_score = 0.0
    if quiz_ids:
        attempts = (
            db.query(QuizAttempt)
            .filter(
                QuizAttempt.student_id == student_id,
                QuizAttempt.quiz_id.in_(quiz_ids),
                QuizAttempt.status.in_(["submitted", "evaluated", "timed_out"]),
            )
            .all()
        )
        attempted_quiz_ids = {a.quiz_id for a in attempts}
        completed_quizzes = len(attempted_quiz_ids)
        if attempts:
            avg_quiz_score = round(sum(a.percentage for a in attempts) / len(attempts), 1)

    # Dynamic weight normalization
    weighted_sum = 0.0
    total_weight = 0.0
    if total_lectures > 0:
        weighted_sum += (completed_lectures / total_lectures) * 50.0
        total_weight += 50.0
    if total_assignments > 0:
        weighted_sum += (min(submitted_assignments, total_assignments) / total_assignments) * 30.0
        total_weight += 30.0
    if total_quizzes > 0:
        weighted_sum += (min(completed_quizzes, total_quizzes) / total_quizzes) * 20.0
        total_weight += 20.0

    completion_pct = round((weighted_sum / total_weight) * 100.0, 1) if total_weight > 0 else 0.0

    attendance_stats = calculate_attendance_stats(db, student_id=student_id, course_id=course_id)

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        .first()
    )
    course = db.query(Course).filter(Course.id == course_id).first()
    threshold = course.completion_threshold_pct if course else 75

    if enrollment:
        enrollment.completion_percentage = completion_pct
        if completion_pct >= threshold and enrollment.status == "active":
            enrollment.status = "completed"
            enrollment.completed_at = enrollment.completed_at or datetime.now()
        db.flush()

    return {
        "student_id": student_id,
        "course_id": course_id,
        "course_title": course.title if course else "",
        "total_lectures": total_lectures,
        "completed_lectures": completed_lectures,
        "pending_lectures": max(0, total_lectures - completed_lectures),
        "total_assignments": total_assignments,
        "submitted_assignments": submitted_assignments,
        "avg_assignment_score": avg_assignment_score,
        "total_quizzes": total_quizzes,
        "completed_quizzes": completed_quizzes,
        "avg_quiz_score": avg_quiz_score,
        "attendance_percentage": attendance_stats["attendance_percentage"],
        "completion_percentage": completion_pct,
        "is_eligible_for_certificate": completion_pct >= threshold,
    }


def issue_certificate_service(
    db: Session,
    student_id: int,
    course_id: int,
    issued_by_id: Optional[int] = None,
    force_issue: bool = False,
) -> Certificate:
    existing = (
        db.query(Certificate)
        .filter(Certificate.student_id == student_id, Certificate.course_id == course_id)
        .first()
    )
    if existing:
        if not existing.pdf_file_path:
            existing.pdf_file_path = generate_certificate_pdf(
                certificate_number=existing.certificate_number,
                verification_code=existing.verification_code,
                student_name=existing.student.full_name if existing.student else "Student",
                course_title=existing.course.title if existing.course else "Course",
                completion_date=existing.completion_date,
                issue_date=existing.issue_date,
                grade=existing.grade,
                final_percentage=existing.final_percentage,
            )
            db.commit()
            db.refresh(existing)
        return existing

    student = db.query(User).filter(User.id == student_id, User.is_deleted == False).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    course = db.query(Course).filter(Course.id == course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment and not force_issue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is not enrolled in this course.",
        )

    progress = recalculate_student_course_progress(db, student_id=student_id, course_id=course_id)
    if not force_issue and progress["completion_percentage"] < course.completion_threshold_pct:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course completion ({progress['completion_percentage']}%) is below required threshold ({course.completion_threshold_pct}%).",
        )

    score_components = [
        s for s in [progress["avg_assignment_score"], progress["avg_quiz_score"], progress["completion_percentage"]] if s > 0
    ]
    final_pct = round(sum(score_components) / len(score_components), 1) if score_components else 85.0
    if final_pct >= 90:
        grade = "A+"
    elif final_pct >= 80:
        grade = "A"
    elif final_pct >= 70:
        grade = "B+"
    elif final_pct >= 60:
        grade = "B"
    else:
        grade = "C"

    today = date.today()
    cert_num = f"CERT-{today.year}-{course_id:02d}{student_id:03d}-{uuid.uuid4().hex[:6].upper()}"
    verif_code = f"NXV-{uuid.uuid4().hex[:10].upper()}"

    pdf_url = generate_certificate_pdf(
        certificate_number=cert_num,
        verification_code=verif_code,
        student_name=student.full_name,
        course_title=course.title,
        completion_date=today,
        issue_date=today,
        grade=grade,
        final_percentage=final_pct,
    )

    cert = Certificate(
        certificate_number=cert_num,
        verification_code=verif_code,
        student_id=student_id,
        course_id=course_id,
        batch_id=enrollment.batch_id if enrollment else None,
        enrollment_id=enrollment.id if enrollment else None,
        issue_date=today,
        completion_date=today,
        grade=grade,
        final_percentage=final_pct,
        pdf_file_path=pdf_url,
        issued_by=issued_by_id,
        is_revoked=False,
    )
    db.add(cert)

    if enrollment:
        enrollment.status = "completed"
        enrollment.completion_percentage = max(enrollment.completion_percentage, float(course.completion_threshold_pct))
        enrollment.completed_at = enrollment.completed_at or datetime.now()

    create_notification(
        db=db,
        user_id=student_id,
        title="Course Certificate Issued!",
        message=f"Congratulations! Your certificate ({cert_num}) for {course.title} is now available for download.",
        notification_type="general",
        reference_type="certificate",
    )
    db.commit()
    db.refresh(cert)
    return cert


def create_or_update_payment_service(
    db: Session,
    student_id: int,
    course_id: int,
    paid_amount: float,
    payment_method: str = "bank_transfer",
    transaction_reference: Optional[str] = None,
    payment_date: Optional[date] = None,
    total_fee: Optional[float] = None,
    notes: Optional[str] = None,
    recorded_by_id: Optional[int] = None,
    status_override: Optional[str] = None,
) -> Payment:
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        .first()
    )

    resolved_total_fee = Decimal(str(total_fee if total_fee is not None else float(course.fee)))
    resolved_paid = Decimal(str(paid_amount))
    if resolved_paid < Decimal("0.00"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Paid amount cannot be negative.")

    pending = max(Decimal("0.00"), resolved_total_fee - resolved_paid)

    if status_override in ("failed", "refunded"):
        pay_status = status_override
    elif resolved_paid >= resolved_total_fee and resolved_total_fee > Decimal("0.00"):
        pay_status = "paid"
    elif resolved_paid > Decimal("0.00"):
        pay_status = "partially_paid"
    else:
        pay_status = "pending"

    pay_date = payment_date or date.today()
    inv_num = f"INV-{pay_date.year}-{uuid.uuid4().hex[:8].upper()}"

    payment = Payment(
        invoice_number=inv_num,
        student_id=student_id,
        course_id=course_id,
        enrollment_id=enrollment.id if enrollment else None,
        total_fee=resolved_total_fee,
        paid_amount=resolved_paid,
        pending_amount=pending,
        payment_date=pay_date,
        payment_method=payment_method,
        transaction_reference=transaction_reference or f"TXN-{uuid.uuid4().hex[:10].upper()}",
        status=pay_status,
        notes=notes,
        recorded_by=recorded_by_id,
    )
    db.add(payment)
    db.flush()

    rcp_num = f"RCP-{pay_date.year}-{payment.id:04d}-{uuid.uuid4().hex[:4].upper()}"
    pdf_path = generate_payment_receipt_pdf(
        receipt_number=rcp_num,
        invoice_number=inv_num,
        student_name=student.full_name,
        student_email=student.email,
        course_title=course.title,
        total_fee=resolved_total_fee,
        paid_amount=resolved_paid,
        pending_amount=pending,
        payment_date=pay_date,
        payment_method=payment_method,
        transaction_reference=payment.transaction_reference or "",
        payment_status=pay_status,
    )
    receipt = PaymentReceipt(
        payment_id=payment.id,
        receipt_number=rcp_num,
        amount=resolved_paid,
        pdf_file_path=pdf_path,
    )
    db.add(receipt)

    create_notification(
        db=db,
        user_id=student_id,
        title="Fee Payment Recorded",
        message=f"A payment of ${float(resolved_paid):,.2f} for {course.title} (Invoice {inv_num}) has been recorded. Status: {pay_status.replace('_', ' ').title()}.",
        notification_type="payment",
        reference_type="payment",
        reference_id=payment.id,
    )
    db.commit()
    db.refresh(payment)
    return payment
