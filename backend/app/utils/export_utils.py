"""Export utilities for CSV, Excel (.xlsx), and PDF generation using Pandas, OpenPyXL, and ReportLab."""
from io import BytesIO, StringIO
from typing import Any, Dict, List
import pandas as pd
from fastapi.responses import Response
from app.utils.pdf_generator import generate_tabular_report_pdf


def export_dataset(
    title: str,
    records: List[Dict[str, Any]],
    export_format: str = "csv",
    filename_prefix: str = "report",
) -> Response:
    fmt = export_format.lower().strip()
    if not records:
        records = [{"Info": "No records found for selected filters"}]

    df = pd.DataFrame(records)

    if fmt == "csv":
        stream = StringIO()
        df.to_csv(stream, index=False)
        return Response(
            content=stream.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )
    elif fmt in ("xlsx", "excel"):
        output = BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name=title[:30])
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.xlsx"'},
        )
    elif fmt == "pdf":
        columns = list(df.columns)
        rows = df.values.tolist()
        pdf_bytes = generate_tabular_report_pdf(title=title, columns=columns, rows=rows)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.pdf"'},
        )
    else:
        stream = StringIO()
        df.to_csv(stream, index=False)
        return Response(
            content=stream.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )
