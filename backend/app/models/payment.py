from datetime import date, datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.user import User


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    invoice_number: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    enrollment_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("enrollments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    total_fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    pending_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    payment_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    payment_method: Mapped[str] = mapped_column(
        String(50), default="bank_transfer", nullable=False
    )  # cash, bank_transfer, upi, card, cheque, online
    transaction_reference: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, index=True)
    status: Mapped[str] = mapped_column(
        String(30), default="paid", nullable=False, index=True
    )  # paid, partially_paid, pending, failed, refunded
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], lazy="joined")
    course: Mapped["Course"] = relationship("Course", lazy="joined")
    enrollment: Mapped[Optional["Enrollment"]] = relationship("Enrollment", lazy="joined")
    receipts: Mapped[List["PaymentReceipt"]] = relationship(
        "PaymentReceipt", back_populates="payment", cascade="all, delete-orphan", lazy="joined"
    )


class PaymentReceipt(Base):
    __tablename__ = "payment_receipts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    payment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    receipt_number: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    pdf_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )

    payment: Mapped["Payment"] = relationship("Payment", back_populates="receipts")
