from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.course_module import CourseModule
    from app.models.question import Question
    from app.models.user import User


class Quiz(Base, TimestampMixin):
    __tablename__ = "quizzes"

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
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    total_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    passing_marks: Mapped[float] = mapped_column(Float, default=40.0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    available_from: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    available_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    max_attempts: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    allow_retake: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    shuffle_questions: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="published", nullable=False, index=True
    )  # draft, published, closed
    created_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    course: Mapped["Course"] = relationship("Course", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", lazy="joined")
    questions: Mapped[List["Question"]] = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan", order_by="Question.sort_order"
    )
