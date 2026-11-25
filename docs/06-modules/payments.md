# Module Specification: Fee Ledger, Payments & Receipts (`payments.md`)

**Module Route Prefix:** `/api/v1/payments`  
**Database Tables:** `enrollments`, `payments`, `payment_receipts`, `audit_logs`, `notifications`  

---

## 1. Module Responsibilities
1. Maintain an accurate per-enrollment tuition ledger (`total_fee`, `discount_amount`, `paid_amount`, `pending_amount`).
2. Process full or multi-installment payments across `CASH`, `CARD`, `UPI`, `BANK_TRANSFER`, and `ONLINE_GATEWAY`.
3. Enforce the accounting invariant `Paid + Pending = Net Total Fee` on every transaction.
4. Generate sequential, immutable payment receipt vouchers (`payment_receipts`) with downloadable PDF summaries.

---

## 2. Transactional Payment Flow
1. Admin submits `POST /api/v1/payments` with `enrollment_id`, `amount`, `payment_method`, and `transaction_ref`.
2. Service validates:
   - `amount > 0`
   - `amount <= enrollment.pending_amount` (prevents overpayment; returns `422 OVERPAYMENT_NOT_ALLOWED` if exceeded).
3. Service updates `enrollment`:
   - `enrollment.paid_amount += amount`
   - `enrollment.pending_amount = (enrollment.total_fee - enrollment.discount_amount) - enrollment.paid_amount`
4. Service creates `payments` row (`status = 'SUCCESS'`) and generates a `payment_receipts` record with a unique code (`RCPT-2026-XXXXX`) and `balance_after = enrollment.pending_amount`.
5. Service inserts an in-app notification for the student and an `audit_logs` entry for the Admin.
