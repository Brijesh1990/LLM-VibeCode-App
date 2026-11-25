"""Pytest configuration and shared fixtures for NexusLMS Enterprise Backend."""
from datetime import date, datetime
from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.jwt import create_access_token
from app.core.security import hash_password
from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models import (
    Batch,
    Course,
    CourseCategory,
    Enrollment,
    InstructorProfile,
    Role,
    User,
)

TEST_DATABASE_URL = "mysql+pymysql://root:admin@localhost:3306/lms_test_db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Drop and recreate all tables in lms_test_db and seed baseline roles, users, category, and course."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()
    try:
        admin_role = Role(name="admin", description="Institute Administrator")
        instructor_role = Role(name="instructor", description="Course Instructor")
        student_role = Role(name="student", description="Enrolled Student")
        db.add_all([admin_role, instructor_role, student_role])
        db.flush()

        admin_user = User(
            role_id=admin_role.id,
            full_name="Test Admin User",
            email="admin@test.edu",
            phone="+1-555-0100",
            password_hash=hash_password("Admin@123"),
            is_active=True,
            is_deleted=False,
        )
        instructor_user = User(
            role_id=instructor_role.id,
            full_name="Test Instructor User",
            email="instructor@test.edu",
            phone="+1-555-0101",
            password_hash=hash_password("Instructor@123"),
            is_active=True,
            is_deleted=False,
        )
        student_user = User(
            role_id=student_role.id,
            full_name="Test Student User",
            email="student@test.edu",
            phone="+1-555-0102",
            student_code="STU-2026-0001",
            password_hash=hash_password("Student@123"),
            is_active=True,
            is_deleted=False,
        )
        inactive_user = User(
            role_id=student_role.id,
            full_name="Inactive Student User",
            email="inactive@test.edu",
            phone="+1-555-0199",
            student_code="STU-2026-0099",
            password_hash=hash_password("Inactive@123"),
            is_active=False,
            is_deleted=False,
        )
        db.add_all([admin_user, instructor_user, student_user, inactive_user])
        db.flush()

        ins_profile = InstructorProfile(
            user_id=instructor_user.id,
            employee_code="INS-2026-001",
            department="Computer Science & Engineering",
            designation="Lead Architect & Instructor",
            qualification="Ph.D. Computer Science",
            specialization="Distributed Systems & FastAPI",
            experience_years=8,
            joining_date=date(2022, 1, 15),
        )
        db.add(ins_profile)

        cat = CourseCategory(
            name="Software Engineering",
            slug="software-engineering",
            description="Enterprise Software & Backend Engineering",
            icon="Code",
            is_active=True,
        )
        db.add(cat)
        db.flush()

        course = Course(
            course_code="CRS-BASE-101",
            title="Enterprise FastAPI & React Architecture",
            slug="enterprise-fastapi-react-architecture",
            category_id=cat.id,
            instructor_id=instructor_user.id,
            description="End-to-end production full-stack engineering course.",
            duration_weeks=12,
            duration_hours=60,
            fee=Decimal("1200.00"),
            level="Advanced",
            status="published",
            completion_threshold_pct=75,
        )
        db.add(course)
        db.flush()

        batch = Batch(
            batch_code="BAT-BASE-01",
            name="Morning Cohort Alpha",
            course_id=course.id,
            instructor_id=instructor_user.id,
            start_date=date(2026, 1, 10),
            end_date=date(2026, 6, 30),
            class_days="Mon, Wed, Fri",
            class_timing="09:00 AM - 11:00 AM",
            capacity=25,
            status="active",
        )
        db.add(batch)
        db.flush()

        enrollment = Enrollment(
            enrollment_number="ENR-BASE-0001",
            student_id=student_user.id,
            course_id=course.id,
            batch_id=batch.id,
            status="active",
            completion_percentage=0.0,
        )
        db.add(enrollment)
        db.commit()
    finally:
        db.close()

    yield


@pytest.fixture()
def db_session() -> Session:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def admin_user(db_session: Session) -> User:
    return db_session.query(User).filter(User.email == "admin@test.edu").first()


@pytest.fixture()
def instructor_user(db_session: Session) -> User:
    return db_session.query(User).filter(User.email == "instructor@test.edu").first()


@pytest.fixture()
def student_user(db_session: Session) -> User:
    return db_session.query(User).filter(User.email == "student@test.edu").first()


@pytest.fixture()
def admin_headers(admin_user: User) -> dict:
    token = create_access_token(
        subject=admin_user.id,
        role="admin",
        email=admin_user.email,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def instructor_headers(instructor_user: User) -> dict:
    token = create_access_token(
        subject=instructor_user.id,
        role="instructor",
        email=instructor_user.email,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def student_headers(student_user: User) -> dict:
    token = create_access_token(
        subject=student_user.id,
        role="student",
        email=student_user.email,
    )
    return {"Authorization": f"Bearer {token}"}
