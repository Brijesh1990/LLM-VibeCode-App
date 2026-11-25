import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarRange,
  Users,
  CalendarCheck,
  UserPlus,
  UserMinus,
  Clock,
  Calendar,
} from 'lucide-react';
import { batchService } from '../../services/batchService';
import { studentService } from '../../services/studentService';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function InstructorBatchesPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Roster Modal State
  const [activeBatch, setActiveBatch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState(null);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const [batRes, stuRes] = await Promise.all([
        batchService.listBatches(),
        studentService.listStudents({ limit: 200 }),
      ]);
      setBatches(batRes.items || []);
      setAllStudents(stuRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load assigned batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const refreshActiveBatch = async (batchId) => {
    const updated = await batchService.getBatch(batchId);
    setActiveBatch(updated);
    setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
  };

  const handleAddStudentToBatch = async (e) => {
    e.preventDefault();
    if (!activeBatch || !selectedStudentId) return;
    try {
      setAddingStudent(true);
      await batchService.addStudentToBatch(activeBatch.id, Number(selectedStudentId));
      toast.success('Student added to batch roster!');
      setSelectedStudentId('');
      await refreshActiveBatch(activeBatch.id);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not add student to batch.');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!activeBatch) return;
    try {
      setRemovingStudentId(studentId);
      await batchService.removeStudentFromBatch(activeBatch.id, studentId);
      toast.success('Student removed from batch roster.');
      await refreshActiveBatch(activeBatch.id);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not remove student.');
    } finally {
      setRemovingStudentId(null);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(
      (b) =>
        !search ||
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.batch_code?.toLowerCase().includes(search.toLowerCase()) ||
        b.course_title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  if (loading) {
    return <Loader text="Loading your assigned cohorts and student rosters..." />;
  }

  const rosterIds = new Set((activeBatch?.students || []).map((s) => s.id));
  const eligibleStudentsToAdd = allStudents.filter((s) => !rosterIds.has(s.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Batches & Cohort Rosters"
        subtitle="Inspect batch schedules, monitor seat capacity, manage student rosters, and record daily attendance."
        badge={<Badge variant="indigo">{batches.length} Cohorts</Badge>}
      />

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search batches by cohort name, code, or course..."
          className="w-full sm:w-96"
        />
      </div>

      {filteredBatches.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="No assigned batches found"
          description="Cohorts assigned to you will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBatches.map((batch) => {
            const fillPct =
              batch.capacity > 0 ? Math.round((batch.enrolled_count / batch.capacity) * 100) : 0;
            return (
              <div
                key={batch.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="indigo">{batch.batch_code}</Badge>
                    <StatusBadge status={batch.status} />
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{batch.name}</h3>
                  <p className="text-xs font-semibold text-[#4F46E5] mt-0.5">
                    {batch.course_title}
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Schedule & Timing</p>
                      <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#4F46E5]" /> {batch.class_days} •{' '}
                        {batch.class_timing}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Cohort Dates</p>
                      <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#06B6D4]" />{' '}
                        {formatDate(batch.start_date)} – {formatDate(batch.end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={fillPct}
                      label={`Seat Occupancy (${batch.enrolled_count} / ${batch.capacity} Students • ${batch.available_seats} seats open)`}
                      color={fillPct >= 90 ? 'amber' : 'indigo'}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={CalendarCheck}
                    onClick={() => navigate('/instructor/attendance')}
                  >
                    Mark Attendance
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    icon={Users}
                    onClick={() => setActiveBatch(batch)}
                  >
                    Manage Roster ({batch.enrolled_count})
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Batch Roster Management Modal */}
      <Modal
        isOpen={!!activeBatch}
        onClose={() => setActiveBatch(null)}
        title={`Cohort Roster — ${activeBatch?.name || ''}`}
        subtitle={`${activeBatch?.course_title || ''} • Capacity: ${activeBatch?.enrolled_count || 0}/${activeBatch?.capacity || 0} Students`}
        size="lg"
      >
        {activeBatch && (
          <div className="space-y-5">
            {/* Add Student to Batch Form */}
            <form
              onSubmit={handleAddStudentToBatch}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-end gap-3"
            >
              <div className="w-full">
                <Select
                  label="Add Student to Batch Roster"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">Select a student to enroll in this batch...</option>
                  {eligibleStudentsToAdd.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_code} • {s.email})
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="submit"
                icon={UserPlus}
                loading={addingStudent}
                disabled={!selectedStudentId || activeBatch.available_seats <= 0}
                className="shrink-0"
              >
                Assign to Batch
              </Button>
            </form>

            {/* Current Batch Students List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Students in Cohort ({(activeBatch.students || []).length})
              </h4>
              {(activeBatch.students || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No students currently assigned to this batch.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                  {activeBatch.students.map((stu) => (
                    <div
                      key={stu.id}
                      className="p-3.5 bg-white flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {stu.full_name}
                          </span>
                          <Badge variant="slate">{stu.student_code}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{stu.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={UserMinus}
                        loading={removingStudentId === stu.id}
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveStudent(stu.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
