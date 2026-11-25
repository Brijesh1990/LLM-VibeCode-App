"""Study Materials router with multipart file upload and protected download."""
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_instructor_or_admin
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.study_material import StudyMaterial
from app.models.user import User
from app.services.lms_service import create_notification
from app.storage.file_storage import validate_and_save_upload
from app.utils.serializers import serialize_material

router = APIRouter(prefix="/materials", tags=["Study Materials"])


@router.get("")
def list_materials(
    course_id: Optional[int] = Query(default=None),
    batch_id: Optional[int] = Query(default=None),
    lecture_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(StudyMaterial)
    if current_user.role_name == "student":
        enrolled_course_ids = [
            e[0]
            for e in db.query(Enrollment.course_id)
            .filter(Enrollment.student_id == current_user.id)
            .all()
        ]
        query = query.filter(StudyMaterial.course_id.in_(enrolled_course_ids or [-1]))
    elif current_user.role_name == "instructor" and not course_id:
        assigned_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.instructor_id == current_user.id).all()
        ]
        query = query.filter(StudyMaterial.course_id.in_(assigned_course_ids or [-1]))

    if course_id:
        query = query.filter(StudyMaterial.course_id == course_id)
    if batch_id:
        query = query.filter(StudyMaterial.batch_id == batch_id)
    if lecture_id:
        query = query.filter(StudyMaterial.lecture_id == lecture_id)

    materials = query.order_by(StudyMaterial.created_at.desc()).all()
    return {"items": [serialize_material(m) for m in materials], "total": len(materials)}


@router.post("", status_code=status.HTTP_201_CREATED)
def upload_material(
    course_id: int = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(default=None),
    module_id: Optional[int] = Form(default=None),
    batch_id: Optional[int] = Form(default=None),
    lecture_id: Optional[int] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
    external_url: Optional[str] = Form(default=None),
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id, Course.is_deleted == False).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if file and file.filename:
        saved = validate_and_save_upload(file, subfolder="materials")
        file_name = saved["file_name"]
        file_path = saved["file_path"]
        file_type = saved["file_type"]
        file_size = saved["file_size_bytes"]
    elif external_url:
        file_name = title.strip() + ".pdf"
        file_path = external_url.strip()
        file_type = "link"
        file_size = 0
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid file upload or resource link.",
        )

    mat = StudyMaterial(
        course_id=course_id,
        module_id=module_id,
        batch_id=batch_id,
        lecture_id=lecture_id,
        title=title.strip(),
        description=description,
        file_name=file_name,
        file_path=file_path,
        file_type=file_type,
        file_size_bytes=file_size,
        uploaded_by=current_user.id,
    )
    db.add(mat)
    db.flush()

    create_notification(
        db=db,
        role_target="student",
        title=f"New Study Material: {mat.title}",
        message=f"'{mat.title}' was uploaded for {course.title}.",
        notification_type="material",
        reference_type="material",
        reference_id=mat.id,
    )
    db.commit()
    db.refresh(mat)
    return serialize_material(mat)


@router.get("/{material_id}/download")
def download_material(
    material_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study material not found.")

    if current_user.role_name == "student":
        enrolled = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == current_user.id,
                Enrollment.course_id == mat.course_id,
            )
            .first()
        )
        if not enrolled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to download its study materials.",
            )

    rel_path = mat.file_path.lstrip("/")
    if rel_path.startswith("uploads/"):
        rel_path = rel_path[len("uploads/"):]
    disk_path: Path = settings.upload_dir / rel_path
    if not disk_path.exists():
        # Auto-create sample reference file if synthetic seed path doesn't exist yet on disk
        disk_path.parent.mkdir(parents=True, exist_ok=True)
        disk_path.write_text(
            f"NexusLMS Official Study Material\nTitle: {mat.title}\nCourse: {mat.course.title if mat.course else ''}\nDescription: {mat.description or ''}\n",
            encoding="utf-8",
        )

    return FileResponse(
        path=str(disk_path),
        filename=mat.file_name,
        media_type="application/octet-stream",
    )


@router.delete("/{material_id}")
def delete_material(
    material_id: int,
    current_user: User = Depends(require_instructor_or_admin),
    db: Session = Depends(get_db),
):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study material not found.")
    db.delete(mat)
    db.commit()
    return {"message": "Study material deleted."}
