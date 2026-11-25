from typing import TYPE_CHECKING, Optional
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.batch import Batch
    from app.models.course import Course
    from app.models.course_module import CourseModule
    from app.models.lecture import Lecture
    from app.models.user import User


class StudyMaterial(Base, TimestampMixin):
    __tablename__ = "study_materials"

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
    lecture_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("lectures.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(220), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), default="pdf", nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    uploaded_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    course: Mapped["Course"] = relationship("Course", lazy="joined")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", lazy="joined")
    batch: Mapped[Optional["Batch"]] = relationship("Batch", lazy="joined")
    lecture: Mapped[Optional["Lecture"]] = relationship("Lecture", lazy="joined")
    uploader: Mapped[Optional["User"]] = relationship("User", foreign_keys=[uploaded_by], lazy="joined")
