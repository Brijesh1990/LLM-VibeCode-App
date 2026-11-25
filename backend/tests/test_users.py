"""Tests for Users, Students, Instructors, System Settings, and RBAC Enforcement."""
from fastapi.testclient import TestClient


def test_rbac_enforcement_blocks_non_admins(
    client: TestClient,
    student_headers: dict,
    instructor_headers: dict,
):
    payload = {
        "full_name": "Unauthorized User Creation",
        "email": "unauth_create@test.edu",
        "password": "Password@123",
        "role": "student",
    }
    # Student cannot list or create users, students, instructors, or update system settings
    assert client.get("/api/v1/users", headers=student_headers).status_code == 403
    assert client.post("/api/v1/users", headers=student_headers, json=payload).status_code == 403
    assert client.post("/api/v1/students", headers=student_headers, json=payload).status_code == 403
    assert client.post("/api/v1/instructors", headers=student_headers, json=payload).status_code == 403
    assert (
        client.put(
            "/api/v1/settings",
            headers=student_headers,
            json={"settings": {"institute_name": "Hacked Name"}},
        ).status_code
        == 403
    )

    # Instructor cannot create users, students, instructors, or update system settings
    assert client.get("/api/v1/users", headers=instructor_headers).status_code == 403
    assert client.post("/api/v1/users", headers=instructor_headers, json=payload).status_code == 403
    assert client.post("/api/v1/students", headers=instructor_headers, json=payload).status_code == 403
    assert client.post("/api/v1/instructors", headers=instructor_headers, json=payload).status_code == 403
    assert (
        client.put(
            "/api/v1/settings",
            headers=instructor_headers,
            json={"settings": {"institute_name": "Instructor Override"}},
        ).status_code
        == 403
    )


def test_admin_users_crud(client: TestClient, admin_headers: dict):
    # List users
    list_res = client.get("/api/v1/users", headers=admin_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 3

    # Create user
    create_res = client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "full_name": "Managed User One",
            "email": "managed1@test.edu",
            "phone": "+1-555-1111",
            "password": "Password@123",
            "role": "student",
            "is_active": True,
        },
    )
    assert create_res.status_code == 201
    user_id = create_res.json()["id"]

    # Get user detail
    get_res = client.get(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert get_res.status_code == 200
    assert get_res.json()["email"] == "managed1@test.edu"

    # Update user
    upd_res = client.put(
        f"/api/v1/users/{user_id}",
        headers=admin_headers,
        json={
            "full_name": "Managed User One Updated",
            "email": "managed1@test.edu",
            "phone": "+1-555-2222",
            "role": "student",
            "is_active": True,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["full_name"] == "Managed User One Updated"

    # Soft delete user
    del_res = client.delete(f"/api/v1/users/{user_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_students_crud(client: TestClient, admin_headers: dict):
    create_res = client.post(
        "/api/v1/students",
        headers=admin_headers,
        json={
            "full_name": "Dedicated Student Profile",
            "email": "student_crud@test.edu",
            "phone": "+1-555-3333",
            "password": "Student@123",
            "role": "student",
            "is_active": True,
        },
    )
    assert create_res.status_code == 201
    stu_id = create_res.json()["id"]
    assert create_res.json()["student_code"].startswith("STU-")

    list_res = client.get("/api/v1/students?search=Dedicated", headers=admin_headers)
    assert list_res.status_code == 200
    assert any(s["id"] == stu_id for s in list_res.json()["items"])

    detail_res = client.get(f"/api/v1/students/{stu_id}", headers=admin_headers)
    assert detail_res.status_code == 200
    assert "attendance" in detail_res.json()

    upd_res = client.put(
        f"/api/v1/students/{stu_id}",
        headers=admin_headers,
        json={
            "full_name": "Dedicated Student Updated",
            "email": "student_crud@test.edu",
            "phone": "+1-555-4444",
            "role": "student",
            "is_active": True,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["full_name"] == "Dedicated Student Updated"

    del_res = client.delete(f"/api/v1/students/{stu_id}", headers=admin_headers)
    assert del_res.status_code == 200


def test_instructors_crud_and_system_settings(client: TestClient, admin_headers: dict):
    create_res = client.post(
        "/api/v1/instructors",
        headers=admin_headers,
        json={
            "full_name": "Prof. Alan Turing",
            "email": "turing@test.edu",
            "phone": "+1-555-5555",
            "password": "Instructor@123",
            "role": "instructor",
            "department": "Artificial Intelligence",
            "designation": "Distinguished Professor",
            "qualification": "Ph.D. Mathematics",
            "specialization": "Computation & Cryptography",
            "experience_years": 12,
            "is_active": True,
        },
    )
    assert create_res.status_code == 201
    ins_id = create_res.json()["id"]
    assert create_res.json()["department"] == "Artificial Intelligence"

    list_res = client.get("/api/v1/instructors", headers=admin_headers)
    assert list_res.status_code == 200
    assert any(i["id"] == ins_id for i in list_res.json()["items"])

    upd_res = client.put(
        f"/api/v1/instructors/{ins_id}",
        headers=admin_headers,
        json={
            "full_name": "Prof. Alan M. Turing",
            "email": "turing@test.edu",
            "role": "instructor",
            "department": "Theoretical CS",
            "experience_years": 14,
            "is_active": True,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["department"] == "Theoretical CS"

    del_res = client.delete(f"/api/v1/instructors/{ins_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # System Settings GET & PUT
    get_set = client.get("/api/v1/settings", headers=admin_headers)
    assert get_set.status_code == 200
    assert "institute_name" in get_set.json()["settings"]

    put_set = client.put(
        "/api/v1/settings",
        headers=admin_headers,
        json={
            "settings": {
                "institute_name": "Nexus Enterprise Testing Academy",
                "attendance_minimum_threshold": "80",
            }
        },
    )
    assert put_set.status_code == 200
    assert put_set.json()["settings"]["institute_name"] == "Nexus Enterprise Testing Academy"
    assert put_set.json()["settings"]["attendance_minimum_threshold"] == "80"
