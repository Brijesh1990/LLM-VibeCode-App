"""Tests for Attendance Bulk Marking, Duplicate Prevention, Audit Logging, Attendance Formula, and Student Progress."""
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Attendance, AuditLog, User


def test_attendance_marking_duplicate_prevention_audit_and_percentage_formula(
    client: TestClient,
    instructor_headers: dict,
    student_headers: dict,
    student_user: User,
    db_session: Session,
):
    # 1. Mark attendance on 2026-04-01 as 'absent'
    mark1 = client.post(
        "/api/v1/attendance/mark",
        headers=instructor_headers,
        json={
            "batch_id": 1,
            "course_id": 1,
            "attendance_date": "2026-04-01",
            "session_status": "scheduled",
            "records": [
                {"student_id": student_user.id, "status": "absent", "remarks": "Initial mark"}
            ],
        },
    )
    assert mark1.status_code == 200

    # 2. Re-mark the exact same (batch_id=1, student_id, date=2026-04-01) as 'present'
    # Verify duplicate record prevention (updates existing row instead of inserting duplicate) and writes AuditLog
    mark1_update = client.post(
        "/api/v1/attendance/mark",
        headers=instructor_headers,
        json={
            "batch_id": 1,
            "course_id": 1,
            "attendance_date": "2026-04-01",
            "session_status": "scheduled",
            "records": [
                {"student_id": student_user.id, "status": "present", "remarks": "Corrected to present"}
            ],
        },
    )
    assert mark1_update.status_code == 200
    assert mark1_update.json()["items"][0]["status"] == "present"

    # End current REPEATABLE READ snapshot on db_session so newly committed rows are visible
    db_session.commit()
    same_day_rows = (
        db_session.query(Attendance)
        .filter(
            Attendance.batch_id == 1,
            Attendance.student_id == student_user.id,
            Attendance.attendance_date == date(2026, 4, 1),
        )
        .all()
    )
    assert len(same_day_rows) == 1

    audit_entry = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "UPDATE_ATTENDANCE", AuditLog.entity_id == same_day_rows[0].id)
        .first()
    )
    assert audit_entry is not None

    # 3. Mark additional sessions to test formula:
    # Attendance % = (Present / Eligible) * 100
    # - 2026-04-01: scheduled, present (counts as Present & Eligible)
    # - 2026-04-02: scheduled, late (counts as Present & Eligible)
    # - 2026-04-03: scheduled, present (counts as Present & Eligible)
    # - 2026-04-04: scheduled, absent (counts as Absent & Eligible)
    # - 2026-04-05: holiday, present (excluded from Eligible denominator)
    # - 2026-04-06: cancelled, absent (excluded from Eligible denominator)
    # - 2026-04-07: scheduled, approved_leave (recorded for audit, excluded from Eligible penalty denominator)
    sessions = [
        ("2026-04-02", "scheduled", "late"),
        ("2026-04-03", "scheduled", "present"),
        ("2026-04-04", "scheduled", "absent"),
        ("2026-04-05", "holiday", "present"),
        ("2026-04-06", "cancelled", "absent"),
        ("2026-04-07", "scheduled", "approved_leave"),
    ]
    for att_date, sess_status, stu_status in sessions:
        r = client.post(
            "/api/v1/attendance/mark",
            headers=instructor_headers,
            json={
                "batch_id": 1,
                "course_id": 1,
                "attendance_date": att_date,
                "session_status": sess_status,
                "records": [{"student_id": student_user.id, "status": stu_status}],
            },
        )
        assert r.status_code == 200

    # Query attendance summary for student in batch 1, course 1:
    # Total sessions = 7
    # Holidays/cancelled = 2
    # Approved leaves = 1
    # Present classes (present + late) = 3
    # Absent classes = 1
    # Eligible classes = 3 + 1 = 4
    # Expected Attendance Percentage = (3 / 4) * 100 = 75.0%
    att_res = client.get(
        "/api/v1/attendance?batch_id=1&course_id=1",
        headers=student_headers,
    )
    assert att_res.status_code == 200
    summary = att_res.json()["summary"]
    assert summary["total_sessions"] == 7
    assert summary["holidays_or_cancelled"] == 2
    assert summary["approved_leaves"] == 1
    assert summary["present_classes"] == 3
    assert summary["absent_classes"] == 1
    assert summary["eligible_classes"] == 4
    assert summary["attendance_percentage"] == 75.0


def test_student_progress_endpoint(
    client: TestClient,
    student_headers: dict,
    instructor_headers: dict,
):
    # Student views own progress for course 1
    prog_res = client.get("/api/v1/progress?course_id=1", headers=student_headers)
    assert prog_res.status_code == 200
    data = prog_res.json()
    assert data["total"] >= 1
    course_prog = data["items"][0]
    assert course_prog["course_id"] == 1
    assert course_prog["completion_percentage"] == 100.0
    assert course_prog["attendance_percentage"] == 75.0
    assert course_prog["is_eligible_for_certificate"] is True

    # Instructor can also view progress overview
    ins_prog = client.get("/api/v1/progress?course_id=1", headers=instructor_headers)
    assert ins_prog.status_code == 200
    assert ins_prog.json()["total"] >= 1
