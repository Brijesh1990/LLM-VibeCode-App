from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.course_category import CourseCategory
    from app.models.course_module import CourseModule
    from app.models.user import User


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("course_categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    instructor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, default=12, nullable=False)
    duration_hours: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    fee: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    level: Mapped[str] = mapped_column(String(50), default="Intermediate", nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="published", nullable=False, index=True
    )  # draft, published, archived
    completion_threshold_pct: Mapped[int] = mapped_column(Integer, default=75, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    category: Mapped["CourseCategory"] = relationship("CourseCategory", back_populates="courses", lazy="joined")
    instructor: Mapped[Optional["User"]] = relationship("User", foreign_keys=[instructor_id], lazy="joined")
    modules: Mapped[List["CourseModule"]] = relationship(
        "CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.sort_order"
    )
