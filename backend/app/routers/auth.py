"""Authentication router: login, register, forgot-password, reset-password, refresh, logout, me, change-password."""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.core.security import (
    generate_secure_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.role import Role
from app.models.user import InstructorProfile, PasswordResetToken, RefreshToken, User
from app.schemas.lms_schemas import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ProfileUpdateRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.services.lms_service import create_notification, log_audit
from app.utils.serializers import serialize_user

router = APIRouter(tags=["Authentication"])


@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email.lower().strip(), User.is_deleted == False)
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Please contact the administrator.",
        )

    user.last_login_at = datetime.now()
    access_token = create_access_token(
        subject=user.id,
        role=user.role_name,
        email=user.email,
    )
    refresh_token, refresh_exp = create_refresh_token(
        subject=user.id,
        role=user.role_name,
    )

    rt_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=refresh_exp,
        user_agent=request.headers.get("user-agent", "")[:250],
        ip_address=request.client.host if request.client else None,
    )
    db.add(rt_record)
    log_audit(
        db=db,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=user.id,
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
    )
    db.commit()
    db.refresh(user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    email_clean = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    requested_role = payload.role.lower().strip()
    if requested_role not in ("student", "instructor"):
        requested_role = "student"

    role_obj = db.query(Role).filter(Role.name == requested_role).first()
    if not role_obj:
        role_obj = Role(name=requested_role, description=f"{requested_role.title()} Role")
        db.add(role_obj)
        db.flush()

    user = User(
        role_id=role_obj.id,
        full_name=payload.full_name.strip(),
        email=email_clean,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        is_active=True,
        is_deleted=False,
    )
    db.add(user)
    db.flush()

    if requested_role == "student":
        user.student_code = f"STU-{datetime.now().year}-{user.id:04d}"
    elif requested_role == "instructor":
        prof = InstructorProfile(
            user_id=user.id,
            employee_code=f"INS-{datetime.now().year}-{user.id:03d}",
            department="Computer Science & Engineering",
            designation="Senior Instructor",
        )
        db.add(prof)

    create_notification(
        db=db,
        user_id=user.id,
        title="Welcome to NexusLMS Enterprise!",
        message=f"Hi {user.full_name}, your {requested_role} account has been activated.",
        notification_type="general",
    )

    access_token = create_access_token(
        subject=user.id,
        role=requested_role,
        email=user.email,
    )
    refresh_token, refresh_exp = create_refresh_token(
        subject=user.id,
        role=requested_role,
    )
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh_token),
            expires_at=refresh_exp,
            ip_address=request.client.host if request.client else None,
        )
    )
    db.commit()
    db.refresh(user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/refresh")
def refresh_access_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    decoded = decode_token(payload.refresh_token, expected_type="refresh")
    token_digest = hash_token(payload.refresh_token)
    stored = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_digest,
            RefreshToken.is_revoked == False,
        )
        .first()
    )
    if not stored or stored.expires_at < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid, expired, or revoked.",
        )

    user = db.query(User).filter(User.id == int(decoded["sub"]), User.is_deleted == False).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or unavailable.",
        )

    # Rotate refresh token
    stored.is_revoked = True
    stored.revoked_at = datetime.now()

    new_access = create_access_token(subject=user.id, role=user.role_name, email=user.email)
    new_refresh, new_exp = create_refresh_token(subject=user.id, role=user.role_name)
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(new_refresh),
            expires_at=new_exp,
        )
    )
    db.commit()
    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": serialize_user(user),
    }


@router.post("/logout")
def logout(
    payload: Optional[RefreshTokenRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload and payload.refresh_token:
        digest = hash_token(payload.refresh_token)
        rt = db.query(RefreshToken).filter(RefreshToken.token_hash == digest).first()
        if rt:
            rt.is_revoked = True
            rt.revoked_at = datetime.now()
    else:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == current_user.id,
            RefreshToken.is_revoked == False,
        ).update({"is_revoked": True, "revoked_at": datetime.now()})
    db.commit()
    return {"message": "Successfully logged out and revoked active refresh tokens."}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == payload.email.lower().strip(), User.is_deleted == False)
        .first()
    )
    reset_token_plain = generate_secure_token(24)
    if user and user.is_active:
        prt = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_token(reset_token_plain),
            expires_at=datetime.now() + timedelta(minutes=30),
            is_used=False,
        )
        db.add(prt)
        db.commit()
        return {
            "message": "Password reset instructions generated.",
            "reset_token": reset_token_plain,
            "expires_in_minutes": 30,
        }
    return {
        "message": "If that email is registered, a password reset link has been sent.",
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    digest = hash_token(payload.token.strip())
    record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == digest,
            PasswordResetToken.is_used == False,
        )
        .first()
    )
    if not record or record.expires_at < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    user = db.query(User).filter(User.id == record.user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.password_hash = hash_password(payload.new_password)
    record.is_used = True
    record.used_at = datetime.now()
    # Revoke existing refresh tokens
    db.query(RefreshToken).filter(RefreshToken.user_id == user.id).update(
        {"is_revoked": True, "revoked_at": datetime.now()}
    )
    db.commit()
    return {"message": "Password has been reset successfully. You may now log in."}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)


@router.put("/profile")
def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip()
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.address is not None:
        current_user.address = payload.address
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    if current_user.instructor_profile:
        prof = current_user.instructor_profile
        if payload.department is not None:
            prof.department = payload.department
        if payload.designation is not None:
            prof.designation = payload.designation
        if payload.qualification is not None:
            prof.qualification = payload.qualification
        if payload.specialization is not None:
            prof.specialization = payload.specialization
        if payload.experience_years is not None:
            prof.experience_years = payload.experience_years

    db.commit()
    db.refresh(current_user)
    return serialize_user(current_user)


@router.put("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    current_user.password_hash = hash_password(payload.new_password)
    log_audit(
        db=db,
        action="CHANGE_PASSWORD",
        entity_type="User",
        entity_id=current_user.id,
        user_id=current_user.id,
    )
    db.commit()
    return {"message": "Password changed successfully."}
