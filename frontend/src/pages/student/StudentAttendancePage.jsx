import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarOff,
  Download,
  Info,
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { batchService } from '../../services/batchService';
import { formatDate, exportTableToPDF } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import Select from '../../components/common/Select';
import SearchInput from '../../components/common/SearchInput';
import Loader from '../../components/common/Loader';

export default function StudentAttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadAttendance = async (courseId = '') => {
    try {
      setLoading(true);
      const params = {};
      if (courseId) params.course_id = Number(courseId);
      const [attRes, enrRes] = await Promise.all([
        attendanceService.listAttendance(params),
        batchService.listEnrollments(),
      ]);
      setRecords(attRes.items || []);
      setSummary(attRes.summary || {});
      setEnrollments(enrRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(courseFilter);
  }, [courseFilter]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchStatus = !statusFilter || r.status === statusFilter || r.session_status === statusFilter;
      const matchSearch =
        !search ||
        r.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        r.batch_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.remarks?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, search]);

  const handleExportPDF = () => {
    const cols = ['Date', 'Course', 'Batch', 'Session Type', 'Status', 'Remarks'];
    const rows = filteredRecords.map((r) => [
      formatDate(r.attendance_date),
      r.course_title,
      r.batch_name,
      (r.session_status || 'scheduled').toUpperCase(),
      (r.status || '').toUpperCase(),
      r.remarks || '—',
    ]);
    exportTableToPDF('Personal Attendance Ledger', cols, rows, 'student_attendance_ledger.pdf');
    toast.success('Attendance report exported to PDF');
  };

  const columns = [
    {
      header: 'Session Date',
      accessor: 'attendance_date',
      render: (r) => (
        <span className="font-bold text-slate-900">{formatDate(r.attendance_date)}</span>
      ),
    },
    {
      header: 'Course',
      accessor: 'course_title',
      render: (r) => <span className="font-semibold text-slate-800">{r.course_title}</span>,
    },
    {
      header: 'Cohort Batch',
      accessor: 'batch_name',
      render: (r) => <Badge variant="indigo">{r.batch_name}</Badge>,
    },
    {
      header: 'Session Type',
      accessor: 'session_status',
      render: (r) => (
        <Badge
          variant={
            r.session_status === 'scheduled'
              ? 'slate'
              : r.session_status === 'holiday'
              ? 'violet'
              : 'amber'
          }
        >
          {(r.session_status || 'scheduled').toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: 'Instructor Remarks',
      accessor: 'remarks',
      render: (r) => <span className="text-xs text-slate-500">{r.remarks || '—'}</span>,
    },
  ];

  if (loading) {
    return <Loader text="Calculating attendance metrics and session history..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance & Eligibility Ledger"
        subtitle="Official session attendance calculated via (Present Classes / Eligible Classes) × 100."
        badge={<Badge variant="green">{summary.attendance_percentage ?? 100}% Overall</Badge>}
        actions={
          records.length > 0 && (
            <Button variant="outline" icon={Download} onClick={handleExportPDF}>
              Export Attendance PDF
            </Button>
          )
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary.attendance_percentage ?? 100}%`}
          subtitle={`(${summary.present_classes ?? 0} / ${summary.eligible_classes ?? 0}) × 100`}
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Present Sessions"
          value={summary.present_classes ?? 0}
          subtitle="Includes On-Time & Late"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Absent Sessions"
          value={summary.absent_classes ?? 0}
          subtitle="Counted in Eligible Base"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Approved Leaves"
          value={summary.approved_leaves ?? 0}
          subtitle="Exempt from Penalty Base"
          icon={Clock}
          color="cyan"
        />
        <StatCard
          title="Holidays / Cancelled"
          value={summary.holidays_or_cancelled ?? 0}
          subtitle="Excluded from Denominator"
          icon={CalendarOff}
          color="violet"
        />
      </div>

      {/* Formula Policy Banner */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Institute Attendance Formula Policy: </span>
          Attendance % is computed as{' '}
          <code className="px-1.5 py-0.5 rounded bg-white border border-indigo-100 font-bold text-[#4F46E5]">
            (Present Classes / Total Eligible Classes) × 100
          </code>
          . Holiday/cancelled sessions and approved medical or academic leaves are recorded for
          audit transparency but excluded from the eligible penalty denominator.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by course, batch, or remarks..."
        />
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Enrolled Courses</option>
          {enrollments.map((e) => (
            <option key={e.course_id} value={e.course_id}>
              {e.course_title}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Attendance Statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
          <option value="approved_leave">Approved Leave</option>
          <option value="holiday">Holiday Session</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredRecords}
        emptyTitle="No attendance records found"
        emptyDescription="Your cohort attendance log will appear here as sessions are conducted."
      />
    </div>
  );
}
