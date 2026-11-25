from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course


class CourseCategory(Base, TimestampMixin):
    __tablename__ = "course_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(80), default="BookOpen", nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    courses: Mapped[List["Course"]] = relationship("Course", back_populates="category")
