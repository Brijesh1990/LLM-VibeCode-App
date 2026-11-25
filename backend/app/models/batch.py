from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User


class Batch(Base, TimestampMixin):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    batch_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    instructor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    class_days: Mapped[str] = mapped_column(String(120), default="Mon, Wed, Fri", nullable=False)
    class_timing: Mapped[str] = mapped_column(String(120), default="10:00 AM - 12:00 PM", nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False, index=True
    )  # upcoming, active, completed, closed, archived

    course: Mapped["Course"] = relationship("Course", lazy="joined")
    instructor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[instructor_id], lazy="joined")
    batch_students: Mapped[List["BatchStudent"]] = relationship(
        "BatchStudent", back_populates="batch", cascade="all, delete-orphan"
    )


class BatchStudent(Base):
    __tablename__ = "batch_students"
    __table_args__ = (UniqueConstraint("batch_id", "student_id", name="uq_batch_student"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    batch_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )
    status: Mapped[str] = mapped_column(String(30), default="active", nullable=False)

    batch: Mapped["Batch"] = relationship("Batch", back_populates="batch_students")
    student: Mapped["User"] = relationship("User", lazy="joined")
