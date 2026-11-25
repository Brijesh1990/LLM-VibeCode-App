"""Tests for Batches, Enrollments, Date Validation (400), and Capacity Enforcement (409)."""
from fastapi.testclient import TestClient
from app.models import User


def test_batch_date_validation_rejects_end_before_start(
    client: TestClient,
    admin_headers: dict,
):
    res = client.post(
        "/api/v1/batches",
        headers=admin_headers,
        json={
            "name": "Invalid Date Batch",
            "course_id": 1,
            "start_date": "2026-08-15",
            "end_date": "2026-07-01",
            "capacity": 20,
        },
    )
    assert res.status_code == 400
    assert "earlier than start date" in res.json()["detail"].lower()


def test_batch_capacity_enforcement_and_enrollments(
    client: TestClient,
    admin_headers: dict,
    instructor_user: User,
    student_user: User,
):
    # Create a new course for batch capacity test
    course_res = client.post(
        "/api/v1/courses",
        headers=admin_headers,
        json={
            "title": "System Design Cohort Course",
            "course_code": "CRS-CAP-101",
            "category_id": 1,
            "instructor_id": instructor_user.id,
            "description": "High-scale distributed systems.",
            "fee": 950.0,
        },
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # Create a batch with capacity = 1
    batch_res = client.post(
        "/api/v1/batches",
        headers=admin_headers,
        json={
            "name": "Single Seat Executive Batch",
            "batch_code": "BAT-CAP-001",
            "course_id": course_id,
            "instructor_id": instructor_user.id,
            "start_date": "2026-03-01",
            "end_date": "2026-06-30",
            "class_days": "Sat, Sun",
            "class_timing": "10:00 AM - 01:00 PM",
            "capacity": 1,
            "status": "active",
        },
    )
    assert batch_res.status_code == 201
    batch_id = batch_res.json()["id"]

    # Create a second student to test capacity overflow
    stu2_res = client.post(
        "/api/v1/students",
        headers=admin_headers,
        json={
            "full_name": "Second Batch Student",
            "email": "batch_stu2@test.edu",
            "password": "Student@123",
            "role": "student",
        },
    )
    assert stu2_res.status_code == 201
    student2_id = stu2_res.json()["id"]

    # Enroll 1st student via /api/v1/enrollments -> 201 Created
    enr1 = client.post(
        "/api/v1/enrollments",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": course_id,
            "batch_id": batch_id,
            "status": "active",
        },
    )
    assert enr1.status_code == 201
    enrollment_id = enr1.json()["id"]

    # Duplicate enrollment for same student + course returns 409
    dup_enr = client.post(
        "/api/v1/enrollments",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": course_id,
            "batch_id": batch_id,
        },
    )
    assert dup_enr.status_code == 409

    # Enrolling 2nd student into batch with capacity=1 returns 409 Conflict via /enrollments
    enr2_conflict = client.post(
        "/api/v1/enrollments",
        headers=admin_headers,
        json={
            "student_id": student2_id,
            "course_id": course_id,
            "batch_id": batch_id,
        },
    )
    assert enr2_conflict.status_code == 409
    assert "capacity" in enr2_conflict.json()["detail"].lower()

    # Adding 2nd student directly via /batches/{id}/students also returns 409 Conflict
    batch_assign_conflict = client.post(
        f"/api/v1/batches/{batch_id}/students",
        headers=admin_headers,
        json={"student_id": student2_id},
    )
    assert batch_assign_conflict.status_code == 409
    assert "capacity" in batch_assign_conflict.json()["detail"].lower()

    # Increase batch capacity to 5 via PUT /api/v1/batches/{id}
    upd_batch = client.put(
        f"/api/v1/batches/{batch_id}",
        headers=admin_headers,
        json={
            "name": "Expanded Executive Batch",
            "course_id": course_id,
            "instructor_id": instructor_user.id,
            "start_date": "2026-03-01",
            "end_date": "2026-06-30",
            "capacity": 5,
            "status": "active",
        },
    )
    assert upd_batch.status_code == 200
    assert upd_batch.json()["capacity"] == 5

    # Now 2nd student can be added to batch
    batch_assign_ok = client.post(
        f"/api/v1/batches/{batch_id}/students",
        headers=admin_headers,
        json={"student_id": student2_id},
    )
    assert batch_assign_ok.status_code == 201
    assert batch_assign_ok.json()["enrolled_count"] == 2

    # List enrollments
    list_enr = client.get(f"/api/v1/enrollments?course_id={course_id}", headers=admin_headers)
    assert list_enr.status_code == 200
    assert list_enr.json()["total"] == 2

    # Update enrollment status
    upd_enr = client.put(
        f"/api/v1/enrollments/{enrollment_id}",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": course_id,
            "batch_id": batch_id,
            "status": "completed",
        },
    )
    assert upd_enr.status_code == 200
    assert upd_enr.json()["status"] == "completed"
