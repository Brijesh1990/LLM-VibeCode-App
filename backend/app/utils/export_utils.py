"""Export utilities for CSV, Excel (.xlsx), and PDF generation using stdlib csv, OpenPyXL, and ReportLab."""
import csv
from io import BytesIO, StringIO
from typing import Any, Dict, List
from fastapi.responses import Response
from app.utils.pdf_generator import generate_tabular_report_pdf


def _collect_columns(records: List[Dict[str, Any]]) -> List[str]:
    columns: List[str] = []
    seen = set()
    for row in records:
        for key in row.keys():
            if key not in seen:
                seen.add(key)
                columns.append(key)
    return columns


def _to_csv_text(records: List[Dict[str, Any]], columns: List[str]) -> str:
    stream = StringIO()
    writer = csv.DictWriter(stream, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    for row in records:
        writer.writerow({c: "" if row.get(c) is None else row.get(c) for c in columns})
    return stream.getvalue()


def export_dataset(
    title: str,
    records: List[Dict[str, Any]],
    export_format: str = "csv",
    filename_prefix: str = "report",
) -> Response:
    fmt = export_format.lower().strip()
    if not records:
        records = [{"Info": "No records found for selected filters"}]

    columns = _collect_columns(records)

    if fmt == "csv":
        return Response(
            content=_to_csv_text(records, columns),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )
    elif fmt in ("xlsx", "excel"):
        try:
            from openpyxl import Workbook

            wb = Workbook()
            ws = wb.active
            ws.title = (title or "Report")[:30]
            ws.append(columns)
            for row in records:
                ws.append(["" if row.get(c) is None else str(row.get(c)) for c in columns])
            output = BytesIO()
            wb.save(output)
            return Response(
                content=output.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.xlsx"'},
            )
        except ImportError:
            return Response(
                content=_to_csv_text(records, columns),
                media_type="text/csv",
                headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
            )
    elif fmt == "pdf":
        rows = [["" if row.get(c) is None else row.get(c) for c in columns] for row in records]
        pdf_bytes = generate_tabular_report_pdf(title=title, columns=columns, rows=rows)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.pdf"'},
        )
    else:
        return Response(
            content=_to_csv_text(records, columns),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )
