from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.user import User


class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(220), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    target_role: Mapped[str] = mapped_column(
        String(30), default="all", nullable=False, index=True
    )  # all, admin, instructor, student
    course_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    batch_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    published_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    course: Mapped[Optional["Course"]] = relationship("Course", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
    author: Mapped[Optional["User"]] = relationship("User", foreign_keys=[published_by], lazy="joined")
