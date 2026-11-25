from datetime import date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.user import User


class Attendance(Base, TimestampMixin):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("batch_id", "student_id", "attendance_date", name="uq_batch_student_date_attendance"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    session_status: Mapped[str] = mapped_column(
        String(30), default="scheduled", nullable=False
    )  # scheduled, holiday, cancelled
    status: Mapped[str] = mapped_column(
        String(30), default="present", nullable=False, index=True
    )  # present, absent, late, approved_leave
    remarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    marked_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    updated_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    batch: Mapped["Batch"] = relationship("Batch", lazy="joined")
    course: Mapped["Course"] = relationship("Course", lazy="joined")
    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], lazy="joined")
