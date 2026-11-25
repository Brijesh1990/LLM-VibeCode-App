import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

export default function PaymentForm({
  students = [],
  courses = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const firstCourse = courses[0];
  const [form, setForm] = useState({
    student_id: students[0]?.id || '',
    course_id: firstCourse?.id || '',
    total_fee: firstCourse?.fee ?? 1200,
    paid_amount: firstCourse?.fee ?? 1200,
    payment_date: today,
    payment_method: 'bank_transfer',
    transaction_reference: '',
    notes: '',
  });

  const handleCourseChange = (cid) => {
    const found = courses.find((c) => Number(c.id) === Number(cid));
    setForm({
      ...form,
      course_id: cid,
      total_fee: found ? found.fee : form.total_fee,
      paid_amount: found ? found.fee : form.paid_amount,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      student_id: Number(form.student_id),
      course_id: Number(form.course_id),
      total_fee: Number(form.total_fee),
      paid_amount: Number(form.paid_amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Student"
          value={form.student_id}
          onChange={(e) => setForm({ ...form, student_id: e.target.value })}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({s.email})
            </option>
          ))}
        </Select>
        <Select
          label="Course"
          value={form.course_id}
          onChange={(e) => handleCourseChange(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} (${c.fee})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Total Course Fee ($)"
          type="number"
          step="0.01"
          required
          value={form.total_fee}
          onChange={(e) => setForm({ ...form, total_fee: e.target.value })}
        />
        <Input
          label="Paid Amount ($)"
          type="number"
          step="0.01"
          required
          value={form.paid_amount}
          onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
        />
        <Input
          label="Pending Balance ($)"
          type="number"
          disabled
          value={Math.max(0, Number(form.total_fee || 0) - Number(form.paid_amount || 0)).toFixed(2)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Payment Method"
          value={form.payment_method}
          onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Credit / Debit Card</option>
          <option value="upi">UPI / Instant Pay</option>
          <option value="cash">Cash Counter</option>
          <option value="cheque">Cheque / DD</option>
        </Select>
        <Input
          label="Payment Date"
          type="date"
          required
          value={form.payment_date}
          onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
        />
        <Input
          label="Transaction Reference"
          placeholder="TXN-2026-9910"
          value={form.transaction_reference}
          onChange={(e) => setForm({ ...form, transaction_reference: e.target.value })}
        />
      </div>

      <Textarea
        label="Payment Remarks / Installment Notes"
        rows={2}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Record Payment & Generate Receipt
        </Button>
      </div>
    </form>
  );
}
