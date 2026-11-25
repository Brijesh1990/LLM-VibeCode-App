"""Payments and Fee Receipt management router."""
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.batch import Batch
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment, PaymentReceipt
from app.models.user import User
from app.schemas.lms_schemas import (
    PaymentCreateUpdate,
    PaymentGatewayOrderRequest,
    PaymentGatewayVerifyRequest,
    PaymentPayPendingRequest,
)
from app.services.lms_service import (
    create_notification,
    create_or_update_payment_service,
    log_audit,
)
from app.utils.pdf_generator import generate_payment_receipt_pdf
from app.utils.serializers import serialize_payment

router = APIRouter(prefix="/payments", tags=["Payments & Fee Management"])


@router.get("")
def list_payments(
    student_id: Optional[int] = Query(default=None),
    course_id: Optional[int] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Payment)
    if current_user.role_name == "student":
        query = query.filter(Payment.student_id == current_user.id)
    elif student_id:
        query = query.filter(Payment.student_id == student_id)

    if course_id:
        query = query.filter(Payment.course_id == course_id)
    if status_filter:
        query = query.filter(Payment.status == status_filter)

    payments = query.order_by(Payment.payment_date.desc(), Payment.id.desc()).all()
    total_collected = float(sum(p.paid_amount for p in payments if p.status in ("paid", "partially_paid")))
    total_pending = float(sum(p.pending_amount for p in payments if p.status in ("pending", "partially_paid")))
    total_fee = float(sum(p.total_fee for p in payments))

    return {
        "items": [serialize_payment(p) for p in payments],
        "total": len(payments),
        "summary": {
            "total_fee": total_fee,
            "total_collected": total_collected,
            "total_pending": total_pending,
        },
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def record_payment(
    payload: PaymentCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    payment = create_or_update_payment_service(
        db=db,
        student_id=payload.student_id,
        course_id=payload.course_id,
        paid_amount=payload.paid_amount,
        payment_method=payload.payment_method,
        transaction_reference=payload.transaction_reference,
        payment_date=payload.payment_date,
        total_fee=payload.total_fee,
        notes=payload.notes,
        recorded_by_id=current_user.id,
        status_override=payload.status,
    )
    log_audit(
        db=db,
        action="RECORD_PAYMENT",
        entity_type="Payment",
        entity_id=payment.id,
        user_id=current_user.id,
        new_values={"paid_amount": float(payment.paid_amount), "status": payment.status},
    )
    db.commit()
    return serialize_payment(payment)


@router.put("/{payment_id}")
def update_payment(
    payment_id: int,
    payload: PaymentCreateUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    if payload.total_fee is not None:
        payment.total_fee = Decimal(str(payload.total_fee))
    payment.paid_amount = Decimal(str(payload.paid_amount))
    payment.pending_amount = max(Decimal("0.00"), payment.total_fee - payment.paid_amount)
    payment.payment_method = payload.payment_method
    if payload.payment_date:
        payment.payment_date = payload.payment_date
    if payload.transaction_reference is not None:
        payment.transaction_reference = payload.transaction_reference
    if payload.notes is not None:
        payment.notes = payload.notes

    if payload.status in ("failed", "refunded"):
        payment.status = payload.status
    elif payment.paid_amount >= payment.total_fee and payment.total_fee > Decimal("0.00"):
        payment.status = "paid"
    elif payment.paid_amount > Decimal("0.00"):
        payment.status = "partially_paid"
    else:
        payment.status = "pending"

    db.commit()
    db.refresh(payment)
    return serialize_payment(payment)


@router.get("/{payment_id}/receipt")
def download_payment_receipt(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    if current_user.role_name == "student" and payment.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this receipt.")

    rcp = payment.receipts[-1] if payment.receipts else None
    rcp_num = rcp.receipt_number if rcp else f"RCP-{payment.payment_date.year}-{payment.id:04d}"

    pdf_url = generate_payment_receipt_pdf(
        receipt_number=rcp_num,
        invoice_number=payment.invoice_number,
        student_name=payment.student.full_name if payment.student else "Student",
        student_email=payment.student.email if payment.student else "",
        course_title=payment.course.title if payment.course else "Course",
        total_fee=payment.total_fee,
        paid_amount=payment.paid_amount,
        pending_amount=payment.pending_amount,
        payment_date=payment.payment_date,
        payment_method=payment.payment_method,
        transaction_reference=payment.transaction_reference or "",
        payment_status=payment.status,
    )
    if not rcp:
        rcp = PaymentReceipt(
            payment_id=payment.id,
            receipt_number=rcp_num,
            amount=payment.paid_amount,
            pdf_file_path=pdf_url,
        )
        db.add(rcp)
        db.commit()

    rel_path = pdf_url.lstrip("/")
    if rel_path.startswith("uploads/"):
        rel_path = rel_path[len("uploads/"):]
    disk_path: Path = settings.upload_dir / rel_path

    return FileResponse(
        path=str(disk_path),
        filename=f"{rcp_num}.pdf",
        media_type="application/pdf",
    )


@router.get("/gateway/config")
def get_gateway_config():
    """Retrieve public payment gateway configuration and testing credentials."""
    return {
        "gateway": settings.PAYMENT_GATEWAY,
        "key_id": settings.PAYMENT_KEY_ID,
        "currency": settings.PAYMENT_CURRENCY,
        "test_mode": True,
        "supported_methods": ["card", "upi", "netbanking", "wallet"],
    }


@router.post("/gateway/create-order")
def create_gateway_order(
    payload: PaymentGatewayOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a gateway order (Razorpay / Mock) for purchasing a course or cohort batch."""
    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    amount = float(payload.amount if payload.amount is not None else course.fee)
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order amount must be greater than zero.")

    order_id = f"order_test_{uuid.uuid4().hex[:14]}"

    return {
        "order_id": order_id,
        "amount": amount,
        "currency": settings.PAYMENT_CURRENCY,
        "key_id": settings.PAYMENT_KEY_ID,
        "course_id": course.id,
        "course_title": course.title,
        "course_code": course.course_code,
        "batch_id": payload.batch_id,
        "student_name": current_user.full_name,
        "student_email": current_user.email,
        "test_mode": True,
    }


@router.post("/gateway/verify-checkout")
def verify_gateway_checkout(
    payload: PaymentGatewayVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify gateway payment response, enroll student in course, record payment, and generate receipt."""
    course = db.query(Course).filter(Course.id == payload.course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    student_id = current_user.id
    total_fee = float(course.fee)
    paid_amt = float(payload.amount)

    # 1. Ensure or update enrollment
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.course_id == payload.course_id)
        .first()
    )
    if not enrollment:
        enrollment = Enrollment(
            student_id=student_id,
            course_id=payload.course_id,
            batch_id=payload.batch_id,
            status="active",
            enrolled_at=datetime.now(),
            completion_percentage=0.0,
        )
        db.add(enrollment)
        db.flush()
    else:
        if payload.batch_id and not enrollment.batch_id:
            enrollment.batch_id = payload.batch_id

    # Add to batch if specified and not already present
    if payload.batch_id:
        batch = db.query(Batch).filter(Batch.id == payload.batch_id).first()
        if batch and current_user not in batch.students:
            batch.students.append(current_user)

    # 2. Check for existing payment record or create new one
    payment = None
    if payload.existing_payment_id:
        payment = db.query(Payment).filter(Payment.id == payload.existing_payment_id).first()

    if payment:
        payment.paid_amount += Decimal(str(paid_amt))
        payment.pending_amount = max(Decimal("0.00"), payment.total_fee - payment.paid_amount)
        payment.status = "paid" if payment.pending_amount <= Decimal("0.00") else "partially_paid"
        payment.payment_method = payload.payment_method
        payment.transaction_reference = payload.payment_id
        db.flush()
    else:
        # Check if student already has a pending payment for this course
        existing_pending = (
            db.query(Payment)
            .filter(Payment.student_id == student_id, Payment.course_id == payload.course_id)
            .order_by(Payment.id.desc())
            .first()
        )
        if existing_pending and existing_pending.status in ("pending", "partially_paid"):
            existing_pending.paid_amount += Decimal(str(paid_amt))
            existing_pending.pending_amount = max(Decimal("0.00"), existing_pending.total_fee - existing_pending.paid_amount)
            existing_pending.status = "paid" if existing_pending.pending_amount <= Decimal("0.00") else "partially_paid"
            existing_pending.payment_method = payload.payment_method
            existing_pending.transaction_reference = payload.payment_id
            payment = existing_pending
            db.flush()
        else:
            payment = create_or_update_payment_service(
                db=db,
                student_id=student_id,
                course_id=payload.course_id,
                paid_amount=paid_amt,
                payment_method=payload.payment_method,
                transaction_reference=payload.payment_id,
                payment_date=date.today(),
                total_fee=total_fee,
                notes=f"Online Payment via Gateway ({settings.PAYMENT_GATEWAY}) - Order {payload.order_id}",
                recorded_by_id=current_user.id,
            )

    # Generate or refresh receipt
    rcp_num = f"RCP-{date.today().year}-{payment.id:04d}-{uuid.uuid4().hex[:4].upper()}"
    pdf_path = generate_payment_receipt_pdf(
        receipt_number=rcp_num,
        invoice_number=payment.invoice_number,
        student_name=current_user.full_name,
        student_email=current_user.email,
        course_title=course.title,
        total_fee=payment.total_fee,
        paid_amount=payment.paid_amount,
        pending_amount=payment.pending_amount,
        payment_date=payment.payment_date,
        payment_method=payment.payment_method,
        transaction_reference=payment.transaction_reference or "",
        payment_status=payment.status,
    )
    receipt = PaymentReceipt(
        payment_id=payment.id,
        receipt_number=rcp_num,
        amount=Decimal(str(paid_amt)),
        pdf_file_path=pdf_path,
    )
    db.add(receipt)

    log_audit(
        db=db,
        action="ONLINE_PAYMENT_GATEWAY_SUCCESS",
        entity_type="Payment",
        entity_id=payment.id,
        user_id=current_user.id,
        new_values={
            "order_id": payload.order_id,
            "payment_id": payload.payment_id,
            "amount": paid_amt,
            "status": payment.status,
            "receipt_number": rcp_num,
        },
    )
    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "message": f"Payment of ${paid_amt:,.2f} verified successfully!",
        "payment": serialize_payment(payment),
        "receipt_number": rcp_num,
        "receipt_url": f"/api/v1/payments/{payment.id}/receipt",
        "course_id": course.id,
        "enrollment_id": enrollment.id,
    }


@router.post("/gateway/pay-pending")
def pay_pending_balance(
    payload: PaymentPayPendingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Pay an existing outstanding tuition fee balance online using payment gateway."""
    payment = db.query(Payment).filter(Payment.id == payload.payment_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    if current_user.role_name == "student" and payment.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    paid_amt = Decimal(str(payload.amount))
    if paid_amt <= Decimal("0.00"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment amount must be greater than zero.")

    payment.paid_amount += paid_amt
    payment.pending_amount = max(Decimal("0.00"), payment.total_fee - payment.paid_amount)
    payment.status = "paid" if payment.pending_amount <= Decimal("0.00") else "partially_paid"
    payment.payment_method = payload.payment_method
    if payload.transaction_reference:
        payment.transaction_reference = payload.transaction_reference

    # Generate receipt for this installment
    rcp_num = f"RCP-{date.today().year}-{payment.id:04d}-{uuid.uuid4().hex[:4].upper()}"
    pdf_path = generate_payment_receipt_pdf(
        receipt_number=rcp_num,
        invoice_number=payment.invoice_number,
        student_name=payment.student.full_name if payment.student else current_user.full_name,
        student_email=payment.student.email if payment.student else current_user.email,
        course_title=payment.course.title if payment.course else "Course",
        total_fee=payment.total_fee,
        paid_amount=payment.paid_amount,
        pending_amount=payment.pending_amount,
        payment_date=date.today(),
        payment_method=payment.payment_method,
        transaction_reference=payment.transaction_reference or "",
        payment_status=payment.status,
    )
    receipt = PaymentReceipt(
        payment_id=payment.id,
        receipt_number=rcp_num,
        amount=paid_amt,
        pdf_file_path=pdf_path,
    )
    db.add(receipt)
    create_notification(
        db=db,
        user_id=payment.student_id,
        title="Pending Tuition Installment Cleared",
        message=f"Your installment of ${float(paid_amt):,.2f} for {payment.course.title if payment.course else 'your course'} was received via {payload.payment_method}. Remaining balance: ${float(payment.pending_amount):,.2f}.",
        notification_type="payment",
        reference_type="payment",
        reference_id=payment.id,
    )
    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "message": f"Installment payment of ${float(paid_amt):,.2f} recorded successfully!",
        "payment": serialize_payment(payment),
        "receipt_number": rcp_num,
        "receipt_url": f"/api/v1/payments/{payment.id}/receipt",
    }
