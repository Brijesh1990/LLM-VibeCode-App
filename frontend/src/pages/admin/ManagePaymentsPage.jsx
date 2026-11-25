import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Download, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { API_BASE_URL } from '../../constants';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import PaymentForm from '../../components/forms/PaymentForm';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function ManagePaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        paymentService.listPayments(),
        studentService.listStudents(),
        courseService.listCourses(),
      ]);
      setPayments(pRes.items || []);
      setSummary(pRes.summary || {});
      setStudents(sRes.items || []);
      setCourses(cRes.items || []);
    } catch {
      toast.error('Failed to load payments.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecord = async (payload) => {
    setSaving(true);
    try {
      await paymentService.recordPayment(payload);
      toast.success('Payment recorded and official PDF receipt generated!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const token = localStorage.getItem('lms_access_token');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment & Fee Management"
        subtitle="Record full or partial tuition payments, track pending balances, and download official PDF receipts"
        actions={
          <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
            Record Payment
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed Tuition"
          value={formatCurrency(summary.total_fee)}
          subtitle="Across all recorded invoices"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Total Fee Collected"
          value={formatCurrency(summary.total_collected)}
          subtitle="Verified revenue received"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Pending Outstanding Fees"
          value={formatCurrency(summary.total_pending)}
          subtitle="Awaiting installment clearance"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      <DataTable
        data={payments}
        columns={[
          {
            header: 'Invoice #',
            accessor: 'invoice_number',
            render: (r) => <span className="font-mono text-xs font-bold text-[#4F46E5]">{r.invoice_number}</span>,
          },
          {
            header: 'Student',
            accessor: 'student_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.student_name}</p>
                <p className="text-xs text-slate-500">{r.student_email}</p>
              </div>
            ),
          },
          { header: 'Course', accessor: 'course_title' },
          {
            header: 'Total Fee',
            render: (r) => formatCurrency(r.total_fee),
          },
          {
            header: 'Paid Amount',
            render: (r) => (
              <span className="font-bold text-emerald-700">{formatCurrency(r.paid_amount)}</span>
            ),
          },
          {
            header: 'Pending',
            render: (r) => (
              <span className="font-bold text-amber-600">{formatCurrency(r.pending_amount)}</span>
            ),
          },
          {
            header: 'Date',
            render: (r) => formatDate(r.payment_date),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: 'PDF Receipt',
            render: (r) => (
              <a
                href={`${API_BASE_URL}/payments/${r.id}/receipt?token=${token}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] text-xs font-bold hover:bg-indigo-100"
              >
                <Download className="w-3.5 h-3.5" /> Receipt PDF
              </a>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Fee Payment"
      >
        <PaymentForm
          students={students}
          courses={courses}
          onSubmit={handleRecord}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
