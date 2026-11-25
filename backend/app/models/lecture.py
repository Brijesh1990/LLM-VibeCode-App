from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.course_module import CourseModule
    from app.models.user import User


class Lecture(Base, TimestampMixin):
    __tablename__ = "lectures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    module_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("course_modules.id", ondelete="SET NULL"), nullable=True, index=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(220), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    video_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    course: Mapped["Course"] = relationship("Course", lazy="joined")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")


class LectureProgress(Base, TimestampMixin):
    __tablename__ = "lecture_progress"
    __table_args__ = (UniqueConstraint("student_id", "lecture_id", name="uq_student_lecture_progress"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lecture_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("lectures.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    is_completed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    watched_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    lecture: Mapped["Lecture"] = relationship("Lecture", lazy="joined")
