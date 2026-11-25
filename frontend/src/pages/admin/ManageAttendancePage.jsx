import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarCheck } from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AttendanceForm from '../../components/forms/AttendanceForm';

export default function ManageAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [sessionStatus, setSessionStatus] = useState('scheduled');
  const [statuses, setStatuses] = useState({});
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    batchService.listBatches().then((res) => {
      const list = res.items || [];
      setBatches(list);
      if (list[0]) setSelectedBatchId(String(list[0].id));
    });
  }, []);

  const currentBatch = batches.find((b) => String(b.id) === String(selectedBatchId));

  const loadAttendance = async () => {
    if (!selectedBatchId) return;
    try {
      const res = await attendanceService.listAttendance({
        batch_id: Number(selectedBatchId),
      });
      setHistory(res.items || []);
      setSummary(res.summary || {});

      const map = {};
      (currentBatch?.students || []).forEach((s) => {
        map[s.id] = 'present';
      });
      (res.items || [])
        .filter((r) => r.attendance_date === attendanceDate)
        .forEach((r) => {
          map[r.student_id] = r.status;
        });
      setStatuses(map);
    } catch {
      toast.error('Failed to load attendance records.');
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedBatchId, attendanceDate]);

  const handleSave = async () => {
    if (!currentBatch) return;
    setSaving(true);
    try {
      const records = (currentBatch.students || []).map((stu) => ({
        student_id: stu.id,
        status: statuses[stu.id] || 'present',
      }));
      await attendanceService.markAttendance({
        batch_id: currentBatch.id,
        course_id: currentBatch.course_id,
        attendance_date: attendanceDate,
        session_status: sessionStatus,
        records,
      });
      toast.success('Attendance recorded with audit trail!');
      loadAttendance();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Attendance Management"
        subtitle="Select batch and class date to mark student attendance (Attendance % = Present / Eligible × 100)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Cohort Attendance %"
          value={`${summary.attendance_percentage ?? 100}%`}
          subtitle="Formula: (Present / Eligible) × 100"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Present Records"
          value={summary.present_classes ?? 0}
          subtitle="Scheduled sessions attended"
          color="indigo"
        />
        <StatCard
          title="Absent Records"
          value={summary.absent_classes ?? 0}
          subtitle="Unexcused absences"
          color="rose"
        />
        <StatCard
          title="Approved Leave / Holidays"
          value={(summary.approved_leaves ?? 0) + (summary.holidays_or_cancelled ?? 0)}
          subtitle="Excluded from penalty denominator"
          color="cyan"
        />
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Select Batch"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.course_title})
              </option>
            ))}
          </Select>
          <Input
            label="Class Date"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
          <Select
            label="Session Classification"
            value={sessionStatus}
            onChange={(e) => setSessionStatus(e.target.value)}
          >
            <option value="scheduled">Regular Scheduled Class</option>
            <option value="holiday">Institute Holiday (Excluded)</option>
            <option value="cancelled">Cancelled Session (Excluded)</option>
          </Select>
        </div>

        <AttendanceForm
          roster={currentBatch?.students || []}
          statuses={statuses}
          onStatusChange={(stuId, st) => setStatuses({ ...statuses, [stuId]: st })}
          onSave={handleSave}
          loading={saving}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">Attendance Audit History</h3>
        <DataTable
          data={history}
          columns={[
            { header: 'Date', accessor: 'attendance_date' },
            { header: 'Student', accessor: 'student_name' },
            { header: 'Student ID', accessor: 'student_code' },
            { header: 'Batch', accessor: 'batch_name' },
            {
              header: 'Session',
              render: (r) => <span className="uppercase text-xs font-semibold">{r.session_status}</span>,
            },
            {
              header: 'Status',
              render: (r) => <StatusBadge status={r.status} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
