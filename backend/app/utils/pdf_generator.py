"""ReportLab PDF generators for Course Certificates, Payment Receipts, and Reports."""
from datetime import date, datetime
from decimal import Decimal
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from app.core.config import settings


def generate_certificate_pdf(
    certificate_number: str,
    verification_code: str,
    student_name: str,
    course_title: str,
    completion_date: date | str,
    issue_date: date | str,
    grade: str = "A",
    final_percentage: float = 90.0,
    institute_name: str = "NEXUS INSTITUTE OF TECHNOLOGY & TRAINING",
) -> str:
    """Render an official landscape A4 Certificate PDF via ReportLab and return its relative URL path."""
    cert_dir: Path = settings.upload_dir / "certificates"
    cert_dir.mkdir(parents=True, exist_ok=True)
    filename = f"certificate_{certificate_number.replace('/', '_').replace(' ', '_')}.pdf"
    file_path = cert_dir / filename

    width, height = landscape(A4)
    c = canvas.Canvas(str(file_path), pagesize=landscape(A4))

    # Background & Ornamental Border
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Outer Border (Primary Indigo #4F46E5)
    c.setStrokeColor(colors.HexColor("#4F46E5"))
    c.setLineWidth(5)
    c.rect(22, 22, width - 44, height - 44, fill=0, stroke=1)

    # Inner Border (Secondary Cyan #06B6D4)
    c.setStrokeColor(colors.HexColor("#06B6D4"))
    c.setLineWidth(1.5)
    c.rect(30, 30, width - 60, height - 60, fill=0, stroke=1)

    # Header Crest / Logo Badge
    c.setFillColor(colors.HexColor("#4F46E5"))
    c.circle(width / 2, height - 78, 24, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 84, "NX")

    # Institute Title
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 125, institute_name.upper())

    c.setFillColor(colors.HexColor("#4F46E5"))
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width / 2, height - 170, "CERTIFICATE OF COMPLETION")

    c.setFillColor(colors.HexColor("#64748B"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(width / 2, height - 205, "This is to proudly certify that")

    # Student Name
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-BoldOblique", 28)
    c.drawCentredString(width / 2, height - 248, student_name)

    # Underline beneath student name
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.setLineWidth(1)
    c.line(width / 2 - 180, height - 258, width / 2 + 180, height - 258)

    # Course Text
    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica", 13)
    c.drawCentredString(
        width / 2,
        height - 290,
        "has successfully completed all prescribed coursework, evaluations, and examinations for",
    )

    c.setFillColor(colors.HexColor("#4F46E5"))
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 328, course_title)

    # Achievement Metrics
    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(
        width / 2,
        height - 362,
        f"Final Score: {final_percentage:.1f}%   |   Grade Awarded: {grade}   |   Completion Date: {completion_date}",
    )

    # Signatures & Metadata Footer
    y_footer = 95
    c.setStrokeColor(colors.HexColor("#94A3B8"))
    c.setLineWidth(1)
    # Left metadata block
    c.setFillColor(colors.HexColor("#334155"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(70, y_footer + 20, f"Certificate No: {certificate_number}")
    c.drawString(70, y_footer + 5, f"Verification Code: {verification_code}")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawString(70, y_footer - 10, f"Issue Date: {issue_date}")
    c.drawString(70, y_footer - 24, f"Verify online at: /verify-certificate/{certificate_number}")

    # Center Seal
    c.setStrokeColor(colors.HexColor("#16A34A"))
    c.setLineWidth(2)
    c.circle(width / 2, y_footer + 5, 32, fill=0, stroke=1)
    c.setFillColor(colors.HexColor("#16A34A"))
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(width / 2, y_footer + 10, "VERIFIED")
    c.drawCentredString(width / 2, y_footer - 2, "AUTHENTIC")

    # Right Signature block
    c.setStrokeColor(colors.HexColor("#475569"))
    c.line(width - 250, y_footer + 12, width - 70, y_footer + 12)
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont("Helvetica-BoldOblique", 14)
    c.drawCentredString(width - 160, y_footer + 22, "Dr. Eleanor Vance")
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(width - 160, y_footer - 3, "Director of Academic Affairs")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#64748B"))
    c.drawCentredString(width - 160, y_footer - 16, "Authorized Signatory")

    c.showPage()
    c.save()

    return f"/uploads/certificates/{filename}"


def generate_payment_receipt_pdf(
    receipt_number: str,
    invoice_number: str,
    student_name: str,
    student_email: str,
    course_title: str,
    total_fee: Decimal | float,
    paid_amount: Decimal | float,
    pending_amount: Decimal | float,
    payment_date: date | str,
    payment_method: str,
    transaction_reference: str,
    payment_status: str,
) -> str:
    """Render an official A4 Fee Payment Receipt PDF via ReportLab and return its relative URL path."""
    receipt_dir: Path = settings.upload_dir / "receipts"
    receipt_dir.mkdir(parents=True, exist_ok=True)
    filename = f"receipt_{receipt_number.replace('/', '_').replace(' ', '_')}.pdf"
    file_path = receipt_dir / filename

    doc = SimpleDocTemplate(
        str(file_path),
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        "ReceiptTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=6,
    )
    sub_style = ParagraphStyle(
        "ReceiptSub",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=16,
    )

    story.append(Paragraph("NEXUS INSTITUTE — OFFICIAL FEE RECEIPT", title_style))
    story.append(
        Paragraph(
            f"Receipt #: <b>{receipt_number}</b> &nbsp;|&nbsp; Invoice #: <b>{invoice_number}</b> &nbsp;|&nbsp; Date: <b>{payment_date}</b>",
            sub_style,
        )
    )
    story.append(Spacer(1, 10))

    info_data = [
        ["Student Name", student_name, "Payment Status", payment_status.upper()],
        ["Student Email", student_email, "Payment Method", payment_method.replace("_", " ").upper()],
        ["Course Enrolled", course_title, "Transaction Ref", transaction_reference or "N/A"],
    ]
    info_table = Table(info_data, colWidths=[35 * mm, 55 * mm, 35 * mm, 45 * mm])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F1F5F9")),
                ("BACKGROUND", (2, 0), (2, -1), colors.HexColor("#F1F5F9")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0F172A")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(info_table)
    story.append(Spacer(1, 20))

    fee_data = [
        ["Description", "Total Course Fee", "Amount Paid", "Balance Pending"],
        [
            f"Tuition & Course Fee — {course_title}",
            f"${float(total_fee):,.2f}",
            f"${float(paid_amount):,.2f}",
            f"${float(pending_amount):,.2f}",
        ],
    ]
    fee_table = Table(fee_data, colWidths=[80 * mm, 30 * mm, 30 * mm, 30 * mm])
    fee_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("PADDING", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )
    story.append(fee_table)
    story.append(Spacer(1, 25))
    story.append(
        Paragraph(
            "This is a computer-generated official fee receipt from NexusLMS Enterprise. Thank you for your payment.",
            sub_style,
        )
    )

    doc.build(story)
    return f"/uploads/receipts/{filename}"


def generate_tabular_report_pdf(title: str, columns: List[str], rows: List[List[Any]]) -> bytes:
    """Generate an in-memory PDF report table for any analytics/report export."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"NexusLMS Report — {title}", styles["Heading1"]))
    story.append(
        Paragraph(
            f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 12))

    table_data = [columns] + [[str(cell) if cell is not None else "" for cell in row] for row in rows]
    table = Table(table_data, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    doc.build(story)
    return buffer.getvalue()
