"""Tests for Lectures, Lecture Completion, Study Materials Upload/Download, Assignments, and Submissions Evaluation."""
from datetime import datetime, timedelta
import io
from fastapi.testclient import TestClient


def test_lectures_and_completion_tracking(
    client: TestClient,
    instructor_headers: dict,
    student_headers: dict,
):
    # Create lecture in course 1
    lec_res = client.post(
        "/api/v1/lectures",
        headers=instructor_headers,
        json={
            "course_id": 1,
            "batch_id": 1,
            "title": "Lecture 1: FastAPI Dependency Injection & Async Architecture",
            "description": "Deep dive into FastAPI dependencies and SQLAlchemy 2.x sessions.",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration_minutes": 45,
            "sort_order": 1,
            "is_published": True,
        },
    )
    assert lec_res.status_code == 201
    lecture_id = lec_res.json()["id"]

    # Update lecture
    upd_res = client.put(
        f"/api/v1/lectures/{lecture_id}",
        headers=instructor_headers,
        json={
            "course_id": 1,
            "batch_id": 1,
            "title": "Lecture 1: Enterprise FastAPI Architecture",
            "description": "Updated description",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "duration_minutes": 50,
            "sort_order": 1,
            "is_published": True,
        },
    )
    assert upd_res.status_code == 200
    assert upd_res.json()["duration_minutes"] == 50

    # Student marks lecture as completed
    comp_res = client.post(
        f"/api/v1/lectures/{lecture_id}/complete",
        headers=student_headers,
        json={"is_completed": True, "watched_seconds": 3000},
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert comp_data["is_completed"] is True
    assert comp_data["course_progress"]["completed_lectures"] >= 1

    # Student lists lectures and verifies is_completed flag
    list_res = client.get("/api/v1/lectures?course_id=1", headers=student_headers)
    assert list_res.status_code == 200
    matched = [l for l in list_res.json()["items"] if l["id"] == lecture_id]
    assert matched and matched[0]["is_completed"] is True


def test_study_materials_multipart_upload_and_download(
    client: TestClient,
    instructor_headers: dict,
    student_headers: dict,
):
    pdf_bytes = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n"
    upload_res = client.post(
        "/api/v1/materials",
        headers=instructor_headers,
        data={
            "course_id": "1",
            "title": "FastAPI Architecture Reference Guide",
            "description": "Official architecture slides and cheat sheet",
        },
        files={"file": ("fastapi_guide.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert upload_res.status_code == 201
    mat_id = upload_res.json()["id"]
    assert upload_res.json()["file_type"] == "pdf"

    # List materials
    list_res = client.get("/api/v1/materials?course_id=1", headers=student_headers)
    assert list_res.status_code == 200
    assert any(m["id"] == mat_id for m in list_res.json()["items"])

    # Protected download by enrolled student
    dl_res = client.get(f"/api/v1/materials/{mat_id}/download", headers=student_headers)
    assert dl_res.status_code == 200
    assert dl_res.content.startswith(b"%PDF")


def test_assignments_submissions_and_evaluation_max_marks_validation(
    client: TestClient,
    instructor_headers: dict,
    student_headers: dict,
):
    due_dt = (datetime.now() + timedelta(days=7)).isoformat()

    # Validation: passing_marks > max_marks returns 400
    invalid_assn = client.post(
        "/api/v1/assignments",
        headers=instructor_headers,
        json={
            "course_id": 1,
            "title": "Invalid Marks Assignment",
            "description": "Passing marks higher than max marks",
            "max_marks": 50.0,
            "passing_marks": 60.0,
            "due_date": due_dt,
        },
    )
    assert invalid_assn.status_code == 400

    # Create valid assignment
    assn_res = client.post(
        "/api/v1/assignments",
        headers=instructor_headers,
        json={
            "course_id": 1,
            "batch_id": 1,
            "title": "Capstone Microservice API Specification",
            "description": "Design and implement a RESTful service with JWT RBAC.",
            "instructions": "Upload a ZIP or PDF containing your OpenAPI spec and tests.",
            "max_marks": 100.0,
            "passing_marks": 40.0,
            "due_date": due_dt,
            "allow_late_submission": True,
            "status": "published",
        },
    )
    assert assn_res.status_code == 201
    assignment_id = assn_res.json()["id"]

    # Student uploads assignment submission
    sub_pdf = b"%PDF-1.4\nStudent Assignment Submission Payload\n%%EOF"
    sub_res = client.post(
        "/api/v1/submissions",
        headers=student_headers,
        data={
            "assignment_id": str(assignment_id),
            "submission_text": "Implemented all 19 routers with SQLAlchemy 2.x and Pytest suite.",
        },
        files={"file": ("capstone_submission.pdf", io.BytesIO(sub_pdf), "application/pdf")},
    )
    assert sub_res.status_code == 201
    submission_id = sub_res.json()["id"]
    assert sub_res.json()["status"] == "submitted"

    # Instructor evaluation with marks > max_marks returns 400 Bad Request
    over_marks_res = client.put(
        f"/api/v1/submissions/{submission_id}/evaluate",
        headers=instructor_headers,
        json={
            "marks_obtained": 125.0,
            "feedback_text": "Exceeds max marks validation test",
        },
    )
    assert over_marks_res.status_code == 400
    assert "cannot exceed assignment maximum" in over_marks_res.json()["detail"].lower()

    # Instructor evaluation with valid marks succeeds
    eval_res = client.put(
        f"/api/v1/submissions/{submission_id}/evaluate",
        headers=instructor_headers,
        json={
            "marks_obtained": 92.5,
            "feedback_text": "Excellent architecture, clean schema design, and thorough test coverage.",
            "rubric_notes": "Code Quality: 48/50 | Architecture: 44.5/50",
        },
    )
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["status"] == "evaluated"
    assert eval_data["marks_obtained"] == 92.5
    assert "Excellent architecture" in eval_data["feedback_text"]
