# Module 12: Payment Gateway, Sandbox Testing & Fee Ledger
**Module Prompt Reference:** `NEXUS-PRM-MOD-12`  
**Target Routes:** `/api/v1/payments/*`  
**Security Status:** Sanitized — Test Keys / Sandbox Configuration Only  

---

### Prompt Specification
```markdown
Implement the complete Online Payment Gateway, Sandbox Testing Engine, and Student Fee Ledger for NexusLMS.

Requirements:
1. Financial Invariants:
   - Total Paid + Pending Balance == Total Course Fee.
   - Prevent negative payments or overpayments.
2. Gateway Endpoints:
   - GET /api/v1/payments/gateway/config: Return public gateway info (gateway: 'razorpay_test', key_id: 'rzp_test_NexusLms2026Key', currency: 'USD', test_mode: true).
   - POST /api/v1/payments/gateway/create-order: Generate order_id (`order_test_...`) for tuition fee checkout.
   - POST /api/v1/payments/gateway/verify-checkout: Verify transaction reference, record payment, update enrollment, and generate ReportLab PDF receipt.
   - POST /api/v1/payments/gateway/pay-pending: Pay outstanding fee balances online.
   - GET /api/v1/payments/{id}/receipt: Download official tuition fee receipt PDF.
   - GET, POST, PUT /api/v1/payments: Admin manual ledger operations with audit log tracking.
3. Frontend Integration:
   - PaymentGatewayModal supporting test cards (`4242 4242 4242 4242`), UPI QR (`nexuslms.test@upi`), net banking sandbox, and wallets.
```

### Review Notes & Verification
* **Result:** Implemented in `backend/app/routers/payments.py` and `frontend/src/components/forms/PaymentGatewayModal.jsx`.
* **Testing:** End-to-end verified via `test_all_modules.py` with instant order creation, payment verification, automatic enrollment, and ReportLab PDF receipt download.
