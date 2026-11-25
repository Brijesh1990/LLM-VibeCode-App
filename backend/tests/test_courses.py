"""Tests for Course Categories, Courses, Modules, Search/Filter, and Safe Archiving."""
from fastapi.testclient import TestClient
from app.models import User


def test_categories_crud_and_active_course_protection(client: TestClient, admin_headers: dict):
    # Create category
    cat_res = client.post(
        "/api/v1/categories",
        headers=admin_headers,
        json={
            "name": "Cloud & DevOps Engineering",
            "description": "Kubernetes, Terraform, and Cloud Architecture",
            "icon": "Cloud",
            "is_active": True,
        },
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # Duplicate category name returns 409
    dup_res = client.post(
        "/api/v1/categories",
        headers=admin_headers,
        json={"name": "Cloud & DevOps Engineering"},
    )
    assert dup_res.status_code == 409

    # Update category
    upd_res = client.put(
        f"/api/v1/categories/{cat_id}",
        headers=admin_headers,
        json={
            "name": "Cloud Native & DevOps",
            "description": "Updated Cloud Native description",
            "icon": "Server",
            "is_active": True,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["name"] == "Cloud Native & DevOps"

    # List categories
    list_res = client.get("/api/v1/categories")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 2

    # Delete empty category succeeds
    del_res = client.delete(f"/api/v1/categories/{cat_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Category 1 has seeded active course -> deleting it returns 409 Conflict
    protected_del = client.delete("/api/v1/categories/1", headers=admin_headers)
    assert protected_del.status_code == 409


def test_courses_and_modules_crud_and_search(
    client: TestClient,
    admin_headers: dict,
    instructor_headers: dict,
    instructor_user: User,
):
    # Create course
    c_res = client.post(
        "/api/v1/courses",
        headers=admin_headers,
        json={
            "title": "Applied Machine Learning & MLOps",
            "course_code": "CRS-ML-201",
            "category_id": 1,
            "instructor_id": instructor_user.id,
            "description": "Production ML pipelines, feature stores, and model serving.",
            "duration_weeks": 10,
            "duration_hours": 50,
            "fee": 1500.0,
            "level": "Advanced",
            "status": "published",
            "completion_threshold_pct": 80,
        },
    )
    assert c_res.status_code == 201
    course_id = c_res.json()["id"]
    assert c_res.json()["course_code"] == "CRS-ML-201"

    # Search & filter courses
    search_res = client.get(f"/api/v1/courses?search=MLOps&category_id=1&status=published")
    assert search_res.status_code == 200
    assert any(c["id"] == course_id for c in search_res.json()["items"])

    # Update course by assigned instructor
    upd_res = client.put(
        f"/api/v1/courses/{course_id}",
        headers=instructor_headers,
        json={
            "title": "Applied Machine Learning & Enterprise MLOps",
            "category_id": 1,
            "instructor_id": instructor_user.id,
            "description": "Updated curriculum with LLM deployment.",
            "duration_weeks": 12,
            "duration_hours": 60,
            "fee": 1500.0,
            "level": "Advanced",
            "status": "published",
            "completion_threshold_pct": 80,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["title"] == "Applied Machine Learning & Enterprise MLOps"

    # Create course module
    mod_res = client.post(
        "/api/v1/modules",
        headers=instructor_headers,
        json={
            "course_id": course_id,
            "title": "Module 1: Feature Engineering & Pipelines",
            "description": "Building reproducible data pipelines",
            "sort_order": 1,
            "is_published": True,
        },
    )
    assert mod_res.status_code == 201
    mod_id = mod_res.json()["id"]

    # List modules for course
    mod_list = client.get(f"/api/v1/modules?course_id={course_id}")
    assert mod_list.status_code == 200
    assert len(mod_list.json()["items"]) == 1

    # Update module
    mod_upd = client.put(
        f"/api/v1/modules/{mod_id}",
        headers=instructor_headers,
        json={
            "course_id": course_id,
            "title": "Module 1: Feature Stores & Data Pipelines",
            "description": "Updated module",
            "sort_order": 1,
            "is_published": True,
        },
    )
    assert mod_upd.status_code == 200
    assert mod_upd.json()["title"] == "Module 1: Feature Stores & Data Pipelines"

    # Delete module
    mod_del = client.delete(f"/api/v1/modules/{mod_id}", headers=instructor_headers)
    assert mod_del.status_code == 200


def test_course_safe_archive_when_active_enrollments_exist(
    client: TestClient,
    admin_headers: dict,
    student_user: User,
):
    # Create a course and enroll a student in it
    c_res = client.post(
        "/api/v1/courses",
        headers=admin_headers,
        json={
            "title": "Course With Active Enrollment",
            "course_code": "CRS-ARCH-101",
            "category_id": 1,
            "description": "Testing safe archive protection.",
            "fee": 800.0,
        },
    )
    assert c_res.status_code == 201
    cid = c_res.json()["id"]

    enr_res = client.post(
        "/api/v1/enrollments",
        headers=admin_headers,
        json={"student_id": student_user.id, "course_id": cid, "status": "active"},
    )
    assert enr_res.status_code == 201

    # Attempting to delete a course with active enrollments safely archives it instead of hard-deleting
    del_res = client.delete(f"/api/v1/courses/{cid}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "archived"

    # Verify course still exists in DB with status 'archived'
    detail_res = client.get(f"/api/v1/courses/{cid}")
    assert detail_res.status_code == 200
    assert detail_res.json()["status"] == "archived"
