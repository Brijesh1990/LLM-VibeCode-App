"""Tests for Payments, Fee Receipts PDF, Certificates Generation/Download/Verify, Notifications, Announcements, Dashboard, and Analytics Exports."""
from fastapi.testclient import TestClient
from app.models import User


def test_payments_partial_and_full_calculation_and_pdf_receipt(
    client: TestClient,
    admin_headers: dict,
    student_headers: dict,
    student_user: User,
):
    # 1. Record a partial payment: Total Fee = 1200.00, Paid = 450.00 => Pending = 750.00, status = 'partially_paid'
    partial_res = client.post(
        "/api/v1/payments",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": 1,
            "total_fee": 1200.0,
            "paid_amount": 450.0,
            "payment_method": "card",
            "notes": "First installment payment",
        },
    )
    assert partial_res.status_code == 201
    p_data = partial_res.json()
    payment_id = p_data["id"]
    assert p_data["total_fee"] == 1200.0
    assert p_data["paid_amount"] == 450.0
    assert p_data["pending_amount"] == 750.0
    assert p_data["status"] == "partially_paid"

    # 2. Download PDF receipt for partial payment
    rcp_res = client.get(f"/api/v1/payments/{payment_id}/receipt", headers=student_headers)
    assert rcp_res.status_code == 200
    assert "application/pdf" in rcp_res.headers.get("content-type", "")
    assert rcp_res.content.startswith(b"%PDF")

    # 3. Update payment to full payment: Total = 1200.00, Paid = 1200.00 => Pending = 0.00, status = 'paid'
    full_res = client.put(
        f"/api/v1/payments/{payment_id}",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": 1,
            "total_fee": 1200.0,
            "paid_amount": 1200.0,
            "payment_method": "bank_transfer",
            "notes": "Settled full course tuition fee",
        },
    )
    assert full_res.status_code == 200
    f_data = full_res.json()
    assert f_data["paid_amount"] == 1200.0
    assert f_data["pending_amount"] == 0.0
    assert f_data["status"] == "paid"

    # 4. List payments with summary
    list_res = client.get("/api/v1/payments", headers=student_headers)
    assert list_res.status_code == 200
    assert list_res.json()["summary"]["total_collected"] >= 1200.0


def test_certificate_generation_pdf_download_and_public_verification(
    client: TestClient,
    admin_headers: dict,
    student_user: User,
):
    # Generate certificate for student on course 1
    gen_res = client.post(
        "/api/v1/certificates/generate",
        headers=admin_headers,
        json={
            "student_id": student_user.id,
            "course_id": 1,
            "force_issue": True,
        },
    )
    assert gen_res.status_code == 201
    cert = gen_res.json()
    cert_id = cert["id"]
    cert_number = cert["certificate_number"]
    verif_code = cert["verification_code"]
    assert cert_number.startswith("CERT-")
    assert verif_code.startswith("NXV-")

    # Download certificate PDF
    dl_res = client.get(f"/api/v1/certificates/{cert_id}/download")
    assert dl_res.status_code == 200
    assert "application/pdf" in dl_res.headers.get("content-type", "")
    assert dl_res.content.startswith(b"%PDF")

    # Public certificate verification by verification_code and certificate_number
    ver_res1 = client.get(f"/api/v1/certificates/verify/{verif_code}")
    assert ver_res1.status_code == 200
    assert ver_res1.json()["is_valid"] is True
    assert ver_res1.json()["certificate_number"] == cert_number

    ver_res2 = client.get(f"/api/v1/certificates/verify/{cert_number}")
    assert ver_res2.status_code == 200
    assert ver_res2.json()["verification_code"] == verif_code

    # Invalid verification code returns 404
    bad_ver = client.get("/api/v1/certificates/verify/INVALID-CODE-999")
    assert bad_ver.status_code == 404


def test_notifications_and_announcements(
    client: TestClient,
    admin_headers: dict,
    student_headers: dict,
    student_user: User,
):
    # Create targeted notification
    notif_res = client.post(
        "/api/v1/notifications",
        headers=admin_headers,
        json={
            "user_id": student_user.id,
            "title": "Academic Advising Reminder",
            "message": "Your capstone defense is scheduled for Friday at 2:00 PM.",
            "notification_type": "general",
        },
    )
    assert notif_res.status_code == 201
    notif_id = notif_res.json()["id"]

    # Student lists notifications
    n_list = client.get("/api/v1/notifications", headers=student_headers)
    assert n_list.status_code == 200
    assert n_list.json()["total"] >= 1

    # Mark single notification read
    n_read = client.put(f"/api/v1/notifications/{notif_id}/read", headers=student_headers)
    assert n_read.status_code == 200
    assert n_read.json()["is_read"] is True

    # Mark all notifications read
    n_read_all = client.put("/api/v1/notifications/read-all", headers=student_headers)
    assert n_read_all.status_code == 200

    # Create announcement
    ann_res = client.post(
        "/api/v1/announcements",
        headers=admin_headers,
        json={
            "title": "Semester Hackathon & Career Fair",
            "content": "All cohorts are invited to participate in the annual engineering showcase.",
            "target_role": "all",
            "course_id": 1,
            "is_pinned": True,
            "is_active": True,
        },
    )
    assert ann_res.status_code == 201
    ann_id = ann_res.json()["id"]

    # List announcements
    ann_list = client.get("/api/v1/announcements", headers=student_headers)
    assert ann_list.status_code == 200
    assert any(a["id"] == ann_id for a in ann_list.json()["items"])

    # Update announcement
    ann_upd = client.put(
        f"/api/v1/announcements/{ann_id}",
        headers=admin_headers,
        json={
            "title": "Updated Semester Hackathon & Career Fair",
            "content": "Updated event schedule and registration details.",
            "target_role": "all",
            "course_id": 1,
            "is_pinned": True,
            "is_active": True,
        },
    )
    assert ann_upd.status_code == 200

    # Delete announcement
    ann_del = client.delete(f"/api/v1/announcements/{ann_id}", headers=admin_headers)
    assert ann_del.status_code == 200


def test_reports_dashboard_and_analytics_csv_excel_pdf_exports(
    client: TestClient,
    admin_headers: dict,
    instructor_headers: dict,
    student_headers: dict,
):
    # Role dashboards for Admin, Instructor, and Student
    admin_dash = client.get("/api/v1/reports/dashboard", headers=admin_headers)
    assert admin_dash.status_code == 200
    assert admin_dash.json()["role"] == "admin"
    assert "total_revenue" in admin_dash.json()["kpis"]

    ins_dash = client.get("/api/v1/reports/dashboard", headers=instructor_headers)
    assert ins_dash.status_code == 200
    assert ins_dash.json()["role"] == "instructor"
    assert "assigned_courses" in ins_dash.json()["kpis"]

    stu_dash = client.get("/api/v1/reports/dashboard", headers=student_headers)
    assert stu_dash.status_code == 200
    assert stu_dash.json()["role"] == "student"
    assert "completion_percentage" in stu_dash.json()["kpis"]

    # Analytics JSON reports across report types
    for rtype in ("enrollment", "revenue", "pending_fees", "attendance", "assignments", "quizzes", "course_performance"):
        res = client.get(f"/api/v1/reports/analytics?report_type={rtype}", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["report_type"] == rtype

    # CSV export
    csv_res = client.get("/api/v1/reports/analytics?report_type=revenue&export=csv", headers=admin_headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers.get("content-type", "")
    assert "Invoice #" in csv_res.text

    # Excel (.xlsx) export
    xlsx_res = client.get("/api/v1/reports/analytics?report_type=enrollment&export=xlsx", headers=admin_headers)
    assert xlsx_res.status_code == 200
    assert "spreadsheetml" in xlsx_res.headers.get("content-type", "")
    assert xlsx_res.content[:2] == b"PK"  # ZIP/OOXML magic header

    # PDF export
    pdf_res = client.get("/api/v1/reports/analytics?report_type=attendance&export=pdf", headers=admin_headers)
    assert pdf_res.status_code == 200
    assert "application/pdf" in pdf_res.headers.get("content-type", "")
    assert pdf_res.content.startswith(b"%PDF")
