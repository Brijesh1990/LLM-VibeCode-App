from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.assignment import Assignment
    from app.models.user import User


class Submission(Base, TimestampMixin):
    __tablename__ = "submissions"
    __table_args__ = (UniqueConstraint("assignment_id", "student_id", name="uq_assignment_student_submission"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assignment_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submission_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )
    is_late: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="submitted", nullable=False, index=True
    )  # pending, submitted, under_review, evaluated, late_submission
    marks_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    evaluated_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    evaluated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    assignment: Mapped["Assignment"] = relationship("Assignment", lazy="joined")
    student: Mapped["User"] = relationship("User", foreign_keys=[student_id], lazy="joined")
    evaluator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[evaluated_by], lazy="joined")
    feedback_items: Mapped[List["AssignmentFeedback"]] = relationship(
        "AssignmentFeedback", back_populates="submission", cascade="all, delete-orphan"
    )


class AssignmentFeedback(Base, TimestampMixin):
    __tablename__ = "assignment_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    submission_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    instructor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    feedback_text: Mapped[str] = mapped_column(Text, nullable=False)
    rubric_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    submission: Mapped["Submission"] = relationship("Submission", back_populates="feedback_items")
    instructor: Mapped[Optional["User"]] = relationship("User", lazy="joined")
