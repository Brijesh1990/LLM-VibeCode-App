"""Create or reset the primary Administrator account."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.role import Role
from app.models.user import User


def create_default_admin(
    email: str = "admin@lms.com",
    password: str = "Admin@123",
    full_name: str = "Dr. Eleanor Vance (Chief Admin)",
) -> None:
    db = SessionLocal()
    try:
        for rname, rdesc in [
            ("admin", "Institute Administrator with full system control"),
            ("instructor", "Faculty Instructor managing assigned courses and batches"),
            ("student", "Enrolled Student accessing coursework and assessments"),
        ]:
            if not db.query(Role).filter(Role.name == rname).first():
                db.add(Role(name=rname, description=rdesc))
        db.commit()

        admin_role = db.query(Role).filter(Role.name == "admin").first()
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            existing.password_hash = hash_password(password)
            existing.is_active = True
            existing.is_deleted = False
            db.commit()
            print(f"[OK] Updated existing admin account: {email}")
        else:
            admin = User(
                role_id=admin_role.id,
                full_name=full_name,
                email=email,
                phone="+1-800-555-0100",
                password_hash=hash_password(password),
                bio="Chief Academic & Platform Administrator at Nexus Institute.",
                is_active=True,
                is_deleted=False,
            )
            db.add(admin)
            db.commit()
            print(f"[OK] Created admin account: {email} / {password}")
    finally:
        db.close()


if __name__ == "__main__":
    create_default_admin()
