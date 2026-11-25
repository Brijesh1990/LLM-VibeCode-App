from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.course_module import CourseModule
    from app.models.user import User


class Assignment(Base, TimestampMixin):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    module_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("course_modules.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(220), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reference_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    max_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    passing_marks: Mapped[float] = mapped_column(Float, default=40.0, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    allow_late_submission: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="published", nullable=False, index=True
    )  # draft, published, closed
    created_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    course: Mapped["Course"] = relationship("Course", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", lazy="joined")
    creator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by], lazy="joined")
