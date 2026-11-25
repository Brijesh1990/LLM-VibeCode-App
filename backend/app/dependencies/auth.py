"""Authentication and Role-Based Access Control (RBAC) FastAPI dependencies."""
from typing import Callable, Optional
from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.jwt import decode_token
from app.core.permissions import ensure_roles
from app.database.session import get_db
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    token_query: Optional[str] = Query(default=None, alias="token"),
    db: Session = Depends(get_db),
) -> User:
    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    elif token_query:
        raw_token = token_query

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    payload = decode_token(raw_token, expected_type="access")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
        )

    user = db.query(User).filter(User.id == int(user_id), User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive. Please contact the institute administrator.",
        )
    return user


def require_roles(*roles: str) -> Callable:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        ensure_roles(current_user.role_name, roles)
        return current_user

    return dependency


require_admin = require_roles("admin")
require_instructor_or_admin = require_roles("admin", "instructor")
require_any_authenticated = require_roles("admin", "instructor", "student")
