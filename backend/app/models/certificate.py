from datetime import date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.enrollment import Enrollment
    from app.models.user import User


class Certificate(Base, TimestampMixin):
    __tablename__ = "certificates"
    __table_args__ = (UniqueConstraint("student_id", "course_id", name="uq_student_course_certificate"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    certificate_number: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    verification_code: Mapped[str] = mapped_column(String(80), unique=True, nullable=False, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True
    )
    enrollment_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("enrollments.id", ondelete="SET NULL"), nullable=True
    )
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    completion_date: Mapped[date] = mapped_column(Date, nullable=False)
    grade: Mapped[str] = mapped_column(String(20), default="A", nullable=False)
    final_percentage: Mapped[float] = mapped_column(Float, default=85.0, nullable=False)
    pdf_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    issued_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], lazy="joined")
    course: Mapped["Course"] = relationship("Course", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
    enrollment: Mapped[Optional["Enrollment"]] = relationship("Enrollment", lazy="joined")
