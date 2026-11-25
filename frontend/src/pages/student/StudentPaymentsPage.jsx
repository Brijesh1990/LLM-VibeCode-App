import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { API_BASE_URL } from '../../constants';
import { formatCurrency, formatDate, exportTableToPDF } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import PaymentGatewayModal from '../../components/forms/PaymentGatewayModal';

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ total_fee: 0, total_collected: 0, total_pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [gatewayModal, setGatewayModal] = useState({
    isOpen: false,
    course: null,
    amount: null,
    paymentId: null,
  });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.listPayments();
      setPayments(res.items || []);
      setSummary(res.summary || { total_fee: 0, total_collected: 0, total_pending: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load fee payment ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchSearch =
        !search ||
        p.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        p.transaction_reference?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [payments, statusFilter, search]);

  const handleExportLedgerPDF = () => {
    const cols = ['Invoice #', 'Course', 'Total Fee', 'Paid Amount', 'Pending', 'Method', 'Status', 'Date'];
    const rows = filteredPayments.map((p) => [
      p.invoice_number,
      p.course_title,
      formatCurrency(p.total_fee),
      formatCurrency(p.paid_amount),
      formatCurrency(p.pending_amount),
      (p.payment_method || '').toUpperCase(),
      (p.status || '').toUpperCase(),
      formatDate(p.payment_date),
    ]);
    exportTableToPDF('Student Fee Payment Statement', cols, rows, 'student_fee_statement.pdf');
    toast.success('Fee ledger exported to PDF');
  };

  const token = localStorage.getItem('lms_access_token');

  const columns = [
    {
      header: 'Invoice & Receipt #',
      accessor: 'invoice_number',
      render: (p) => (
        <div>
          <p className="font-mono font-bold text-slate-900">{p.invoice_number}</p>
          <p className="text-xs text-slate-500">Receipt: {p.receipt_number}</p>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course_title',
      render: (p) => <span className="font-semibold text-slate-800">{p.course_title}</span>,
    },
    {
      header: 'Total Fee',
      accessor: 'total_fee',
      render: (p) => <span className="font-medium text-slate-700">{formatCurrency(p.total_fee)}</span>,
    },
    {
      header: 'Paid Amount',
      accessor: 'paid_amount',
      render: (p) => (
        <span className="font-extrabold text-emerald-700">{formatCurrency(p.paid_amount)}</span>
      ),
    },
    {
      header: 'Pending Balance',
      accessor: 'pending_amount',
      render: (p) => (
        <span
          className={`font-bold ${
            p.pending_amount > 0 ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          {formatCurrency(p.pending_amount)}
        </span>
      ),
    },
    {
      header: 'Method & Date',
      accessor: 'payment_date',
      render: (p) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 uppercase">
            {(p.payment_method || '').replace('_', ' ')}
          </p>
          <p className="text-slate-400">{formatDate(p.payment_date)}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.pending_amount > 0 ? (
            <button
              type="button"
              onClick={() =>
                setGatewayModal({
                  isOpen: true,
                  course: {
                    id: p.course_id,
                    title: p.course_title,
                    course_code: p.invoice_number,
                    fee: p.total_fee,
                  },
                  amount: p.pending_amount,
                  paymentId: p.id,
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay Due ({formatCurrency(p.pending_amount)})
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3 h-3" /> Settled
            </span>
          )}
          <a
            href={`${API_BASE_URL}/payments/${p.id}/receipt?token=${token}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => toast.success(`Downloading Receipt ${p.receipt_number}.pdf...`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Receipt
          </a>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading your fee ledger and official payment receipts..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Ledger & Official Payment Receipts"
        subtitle="Track your course tuition fee balances, transaction history, and download official ReportLab PDF receipts."
        badge={<Badge variant="indigo">{payments.length} Transactions</Badge>}
        actions={
          payments.length > 0 && (
            <Button variant="outline" icon={FileText} onClick={handleExportLedgerPDF}>
              Export Statement PDF
            </Button>
          )
        }
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Course Fees"
          value={formatCurrency(summary.total_fee)}
          subtitle="Billed Tuition Amount"
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Total Paid Amount"
          value={formatCurrency(summary.total_collected)}
          subtitle="Verified Fee Payments"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Balance"
          value={formatCurrency(summary.total_pending)}
          subtitle={summary.total_pending > 0 ? 'Outstanding Installment' : 'All Dues Cleared'}
          icon={Clock}
          color={summary.total_pending > 0 ? 'amber' : 'cyan'}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by invoice #, course, or transaction ref..."
          className="w-full sm:w-96"
        />
        <div className="w-full sm:w-64">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        emptyTitle="No fee payment records found"
        emptyDescription="Your tuition invoices and receipts will appear here."
      />

      {/* Payment Gateway Modal for Paying Pending Fees */}
      <PaymentGatewayModal
        isOpen={gatewayModal.isOpen}
        onClose={() => setGatewayModal({ isOpen: false, course: null, amount: null, paymentId: null })}
        course={gatewayModal.course}
        amount={gatewayModal.amount}
        existingPaymentId={gatewayModal.paymentId}
        onSuccess={async () => {
          setGatewayModal({ isOpen: false, course: null, amount: null, paymentId: null });
          await loadPayments();
        }}
      />
    </div>
  );
}
