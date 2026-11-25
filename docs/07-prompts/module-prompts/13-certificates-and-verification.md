# Module 13: Cryptographic Certificates & Public Verification
**Module Prompt Reference:** `NEXUS-PRM-MOD-13`  
**Target Routes:** `/api/v1/certificates/*`  
**Security Status:** Sanitized  

---

### Prompt Specification
```markdown
Construct the PDF Certificate Issuance, Revocation Registry, and Public Verification Engine for NexusLMS.

Requirements:
1. Endpoints:
   - GET /api/v1/certificates: Scoped certificate registry.
   - POST /api/v1/certificates/generate: Issue certificate after validating 4 gates:
     1. Course completion percentage >= completion threshold (75%).
     2. Attendance percentage >= 75%.
     3. Passing grades on assessments.
     4. Pending tuition fee == $0.00.
   - GET /api/v1/certificates/verify/{identifier}: Public verification endpoint accepting certificate_number (e.g., CERT-2026-01005) or verification_code.
   - PUT /api/v1/certificates/{id}/revoke: Admin toggle to revoke a compromised credential.
   - GET /api/v1/certificates/{id}/pdf: Stream official ReportLab PDF certificate.
2. Artifact Requirements:
   - Professional design with certificate border, student name, course title, completion date, grade (A+, A, B), and unique verification QR code.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/certificates.py` and `generate_certificate_pdf` in `pdf_generator.py`.
* **Testing:** Public verification widget tested on landing page (`/verify-certificate/:certificateId`).
