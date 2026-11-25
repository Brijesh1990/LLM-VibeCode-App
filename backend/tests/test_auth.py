"""Tests for Authentication, JWT Lifecycle, Password Reset, and Health Check endpoints."""
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.jwt import create_access_token
from app.models import User


def test_health_check_endpoint(client: TestClient):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_login_valid_roles(client: TestClient):
    for email, password, expected_role in [
        ("admin@test.edu", "Admin@123", "admin"),
        ("instructor@test.edu", "Instructor@123", "instructor"),
        ("student@test.edu", "Student@123", "student"),
    ]:
        res = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert res.status_code == 200
        body = res.json()
        assert "access_token" in body
        assert "refresh_token" in body
        assert body["token_type"] == "bearer"
        assert body["user"]["email"] == email
        assert body["user"]["role"] == expected_role


def test_login_invalid_credentials_returns_401(client: TestClient):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.edu", "password": "WrongPassword999"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_login_inactive_user_returns_403(client: TestClient, db_session: Session):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@test.edu", "password": "Inactive@123"},
    )
    assert res.status_code == 403
    assert "deactivated" in res.json()["detail"].lower()

    # Also verify a forged/existing token for an inactive user is rejected with 403 on protected route
    inactive = db_session.query(User).filter(User.email == "inactive@test.edu").first()
    token = create_access_token(subject=inactive.id, role="student", email=inactive.email)
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 403


def test_register_and_me_endpoint(client: TestClient):
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Newly Registered Student",
            "email": "newstudent@test.edu",
            "phone": "+1-555-0200",
            "password": "NewUser@123",
            "role": "student",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    access_token = reg_data["access_token"]
    assert reg_data["user"]["email"] == "newstudent@test.edu"
    assert reg_data["user"]["role"] == "student"

    # Duplicate email registration returns 409 Conflict
    dup_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Duplicate User",
            "email": "newstudent@test.edu",
            "password": "NewUser@123",
            "role": "student",
        },
    )
    assert dup_res.status_code == 409

    # Verify /api/v1/auth/me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newstudent@test.edu"

    # Unauthenticated /me returns 401
    unauth_res = client.get("/api/v1/auth/me")
    assert unauth_res.status_code == 401


def test_refresh_token_rotation_and_replay_rejection(client: TestClient):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "student@test.edu", "password": "Student@123"},
    )
    assert login_res.status_code == 200
    old_refresh = login_res.json()["refresh_token"]

    # First refresh succeeds and rotates token
    ref_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert ref_res.status_code == 200
    new_refresh = ref_res.json()["refresh_token"]
    assert new_refresh != old_refresh

    # Replaying old rotated refresh token is rejected with 401
    replay_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert replay_res.status_code == 401


def test_change_password_and_forgot_reset_password_flow(client: TestClient):
    # Register a dedicated user for password mutation tests
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Password Flow User",
            "email": "pwflow@test.edu",
            "password": "InitialPassword@1",
            "role": "student",
        },
    )
    assert reg.status_code == 201
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    # Wrong current password returns 400
    bad_change = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "WrongOldPassword", "new_password": "UpdatedPassword@2"},
    )
    assert bad_change.status_code == 400

    # Valid change password
    ok_change = client.put(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "InitialPassword@1", "new_password": "UpdatedPassword@2"},
    )
    assert ok_change.status_code == 200

    # Forgot password generates reset token
    forgot_res = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "pwflow@test.edu"},
    )
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json()["reset_token"]
    assert reset_token

    # Reset password with invalid token returns 400
    bad_reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": "invalid-token-value", "new_password": "ResetPassword@3"},
    )
    assert bad_reset.status_code == 400

    # Reset password with valid token succeeds
    ok_reset = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": "ResetPassword@3"},
    )
    assert ok_reset.status_code == 200

    # Login with newly reset password succeeds
    login_after = client.post(
        "/api/v1/auth/login",
        json={"email": "pwflow@test.edu", "password": "ResetPassword@3"},
    )
    assert login_after.status_code == 200
