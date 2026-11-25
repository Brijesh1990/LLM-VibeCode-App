from enum import Enum
from typing import Iterable
from fastapi import HTTPException, status


class RoleEnum(str, Enum):
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    STUDENT = "student"


def ensure_roles(user_role: str, allowed_roles: Iterable[str]) -> None:
    allowed = {r.lower() for r in allowed_roles}
    if user_role.lower() not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Required role in: {', '.join(sorted(allowed))}",
        )
