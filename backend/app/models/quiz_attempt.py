from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.question import Question, QuizOption
    from app.models.quiz import Quiz
    from app.models.user import User


class QuizAttempt(Base, TimestampMixin):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quiz_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    total_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    obtained_marks: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="in_progress", nullable=False, index=True
    )  # in_progress, submitted, timed_out, evaluated

    quiz: Mapped["Quiz"] = relationship("Quiz", lazy="joined")
    student: Mapped["User"] = relationship("User", lazy="joined")
    answers: Mapped[List["QuizAnswer"]] = relationship(
        "QuizAnswer", back_populates="attempt", cascade="all, delete-orphan", lazy="joined"
    )
    events: Mapped[List["QuizAttemptEvent"]] = relationship(
        "QuizAttemptEvent", back_populates="attempt", cascade="all, delete-orphan"
    )


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    selected_option_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("quiz_options.id", ondelete="SET NULL"), nullable=True
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    marks_awarded: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    answered_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )

    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", lazy="joined")
    selected_option: Mapped[Optional["QuizOption"]] = relationship("QuizOption", lazy="joined")


class QuizAttemptEvent(Base):
    __tablename__ = "quiz_attempt_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(80), nullable=False)
    event_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.now(), server_default=func.now(), nullable=False
    )

    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt", back_populates="events")
