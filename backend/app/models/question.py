from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.quiz import Quiz


class Question(Base, TimestampMixin):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    quiz_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(30), default="mcq", nullable=False)
    marks: Mapped[float] = mapped_column(Float, default=10.0, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")
    options: Mapped[List["QuizOption"]] = relationship(
        "QuizOption", back_populates="question", cascade="all, delete-orphan", order_by="QuizOption.sort_order", lazy="joined"
    )


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    option_text: Mapped[str] = mapped_column(String(500), nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    question: Mapped["Question"] = relationship("Question", back_populates="options")
