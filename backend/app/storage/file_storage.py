"""File storage and upload validation module."""
import os
from pathlib import Path
import uuid
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings


def validate_and_save_upload(
    upload: UploadFile,
    subfolder: str = "materials",
    allowed_extensions: set[str] | None = None,
) -> dict:
    if not upload or not upload.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded.",
        )

    original_name = os.path.basename(upload.filename)
    ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
    allowed = allowed_extensions or settings.allowed_extensions_set

    if not ext or ext not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '.{ext}' is not permitted. Allowed: {', '.join(sorted(allowed))}",
        )

    content = upload.file.read()
    size_bytes = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Content header sanity check for executable disguise prevention
    if content[:2] == b"MZ":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Executable files are strictly prohibited.",
        )

    target_dir: Path = settings.upload_dir / subfolder
    target_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex[:12]}_{original_name.replace(' ', '_')}"
    dest_path = target_dir / unique_filename
    dest_path.write_bytes(content)

    relative_url = f"/uploads/{subfolder}/{unique_filename}"
    return {
        "file_name": original_name,
        "stored_name": unique_filename,
        "file_path": relative_url,
        "absolute_path": str(dest_path),
        "file_type": ext,
        "file_size_bytes": size_bytes,
    }
