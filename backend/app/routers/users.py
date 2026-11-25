"""Users and System Settings router for Admin management."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.role import Role
from app.models.user import AuditLog, InstructorProfile, SystemSetting, User
from app.schemas.lms_schemas import SystemSettingUpdateRequest, UserCreateUpdateRequest
from app.services.lms_service import log_audit
from app.utils.serializers import serialize_user

router = APIRouter(tags=["Users & System Settings"])


@router.get("/users")
def list_users(
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    is_active: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.is_deleted == False)
    if role:
        query = query.join(Role).filter(Role.name == role.lower().strip())
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(User.full_name.ilike(term), User.email.ilike(term), User.phone.ilike(term))
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [serialize_user(u) for u in users],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email_clean = payload.email.lower().strip()
    if db.query(User).filter(User.email == email_clean).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    role_name = payload.role.lower().strip()
    role_obj = db.query(Role).filter(Role.name == role_name).first()
    if not role_obj:
        role_obj = Role(name=role_name, description=f"{role_name.title()} Role")
        db.add(role_obj)
        db.flush()

    user = User(
        role_id=role_obj.id,
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=hash_password(payload.password or "Welcome@123"),
        bio=payload.bio,
        address=payload.address,
        is_active=payload.is_active,
        is_deleted=False,
    )
    db.add(user)
    db.flush()

    if role_name == "student":
        user.student_code = f"STU-{datetime.now().year}-{user.id:04d}"
    elif role_name == "instructor":
        prof = InstructorProfile(
            user_id=user.id,
            employee_code=f"INS-{datetime.now().year}-{user.id:03d}",
            department=payload.department or "Computer Science",
            designation=payload.designation or "Senior Faculty",
            qualification=payload.qualification or "M.Tech / Ph.D.",
            specialization=payload.specialization or "Full Stack Engineering",
            experience_years=payload.experience_years or 5,
            joining_date=payload.joining_date or datetime.now().date(),
        )
        db.add(prof)

    log_audit(
        db=db,
        action="CREATE_USER",
        entity_type="User",
        entity_id=user.id,
        user_id=current_user.id,
        new_values={"email": user.email, "role": role_name},
    )
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return serialize_user(user)


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    payload: UserCreateUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    email_clean = payload.email.lower().strip()
    conflict = db.query(User).filter(User.email == email_clean, User.id != user_id).first()
    if conflict:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already in use.")

    role_name = payload.role.lower().strip()
    role_obj = db.query(Role).filter(Role.name == role_name).first()
    if role_obj:
        user.role_id = role_obj.id

    user.full_name = payload.full_name.strip()
    user.email = email_clean
    user.phone = payload.phone
    user.bio = payload.bio
    user.address = payload.address
    user.is_active = payload.is_active
    if payload.password and len(payload.password.strip()) >= 6 and payload.password != "Welcome@123":
        user.password_hash = hash_password(payload.password)

    if role_name == "instructor":
        prof = user.instructor_profile
        if not prof:
            prof = InstructorProfile(
                user_id=user.id,
                employee_code=f"INS-{datetime.now().year}-{user.id:03d}",
            )
            db.add(prof)
        prof.department = payload.department or prof.department
        prof.designation = payload.designation or prof.designation
        prof.qualification = payload.qualification or prof.qualification
        prof.specialization = payload.specialization or prof.specialization
        if payload.experience_years is not None:
            prof.experience_years = payload.experience_years
        if payload.joining_date is not None:
            prof.joining_date = payload.joining_date

    log_audit(
        db=db,
        action="UPDATE_USER",
        entity_type="User",
        entity_id=user.id,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(user)
    return serialize_user(user)


@router.delete("/users/{user_id}")
def delete_or_deactivate_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own active administrator account.",
        )
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.is_active = False
    user.is_deleted = True
    log_audit(
        db=db,
        action="SOFT_DELETE_USER",
        entity_type="User",
        entity_id=user.id,
        user_id=current_user.id,
    )
    db.commit()
    return {"message": f"User '{user.full_name}' has been deactivated and archived."}


@router.get("/settings")
def get_system_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(SystemSetting).all()
    settings_map = {r.setting_key: r.setting_value for r in rows}
    defaults = {
        "institute_name": "Nexus Institute of Technology & Training",
        "institute_tagline": "Empowering Enterprise Engineering & Data Leaders",
        "institute_email": "admissions@nexuslms.edu",
        "institute_phone": "+1 (800) 555-0199",
        "institute_address": "450 Innovation Way, Tech Park Suite 800, San Francisco, CA",
        "currency_symbol": "$",
        "allow_public_registration": "true",
        "default_passing_percentage": "40",
        "certificate_completion_threshold": "75",
        "attendance_minimum_threshold": "75",
        "smtp_enabled": "false",
    }
    defaults.update(settings_map)
    return {"settings": defaults, "items": [
        {"key": k, "value": v} for k, v in defaults.items()
    ]}


@router.put("/settings")
def update_system_settings(
    payload: SystemSettingUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    for key, val in payload.settings.items():
        row = db.query(SystemSetting).filter(SystemSetting.setting_key == key).first()
        if row:
            row.setting_value = str(val)
            row.updated_by = current_user.id
        else:
            db.add(
                SystemSetting(
                    setting_key=key,
                    setting_value=str(val),
                    setting_group="general",
                    updated_by=current_user.id,
                )
            )
    log_audit(
        db=db,
        action="UPDATE_SYSTEM_SETTINGS",
        entity_type="SystemSetting",
        user_id=current_user.id,
        new_values=payload.settings,
    )
    db.commit()
    return get_system_settings(current_user=current_user, db=db)


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return {
        "items": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "action": l.action,
                "entity_type": l.entity_type,
                "entity_id": l.entity_id,
                "old_values": l.old_values,
                "new_values": l.new_values,
                "ip_address": l.ip_address,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in logs
        ]
    }
