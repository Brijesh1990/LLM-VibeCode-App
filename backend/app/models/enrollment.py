from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.user import User


class Enrollment(Base, TimestampMixin):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "course_id", name="uq_student_course_enrollment"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    enrollment_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False, index=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False, index=True
    )  # active, completed, dropped, suspended
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], lazy="joined")
    course: Mapped["Course"] = relationship("Course", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
