import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users, UserPlus } from 'lucide-react';
import { batchService } from '../../services/batchService';
import { courseService } from '../../services/courseService';
import { instructorService } from '../../services/instructorService';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import BatchForm from '../../components/forms/BatchForm';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [rosterBatch, setRosterBatch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const loadData = async () => {
    try {
      const [bRes, cRes, iRes, sRes] = await Promise.all([
        batchService.listBatches({ search: search || undefined }),
        courseService.listCourses(),
        instructorService.listInstructors(),
        studentService.listStudents(),
      ]);
      setBatches(bRes.items || []);
      setCourses(cRes.items || []);
      setInstructors(iRes.items || []);
      setStudents(sRes.items || []);
      if (rosterBatch) {
        const updated = (bRes.items || []).find((x) => x.id === rosterBatch.id);
        if (updated) setRosterBatch(updated);
      }
    } catch {
      toast.error('Failed to load batches.');
    }
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleSave = async (payload) => {
    try {
      const cleaned = {
        ...payload,
        instructor_id: payload.instructor_id ? Number(payload.instructor_id) : null,
      };
      if (editing) {
        await batchService.updateBatch(editing.id, cleaned);
        toast.success('Batch updated!');
      } else {
        await batchService.createBatch(cleaned);
        toast.success('Batch created!');
      }
      setModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save batch.');
    }
  };

  const handleAddStudent = async () => {
    if (!rosterBatch || !selectedStudentId) return;
    try {
      const updated = await batchService.addStudentToBatch(
        rosterBatch.id,
        Number(selectedStudentId)
      );
      setRosterBatch(updated);
      toast.success('Student assigned to batch!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add student.');
    }
  };

  const handleRemoveStudent = async (stuId) => {
    if (!rosterBatch) return;
    try {
      await batchService.removeStudentFromBatch(rosterBatch.id, stuId);
      toast.success('Student removed from batch.');
      loadData();
    } catch {
      toast.error('Failed to remove student.');
    }
  };

  const handleArchive = async (b) => {
    const ok = await confirmAction({ title: `Archive batch "${b.name}"?` });
    if (!ok) return;
    try {
      await batchService.deleteBatch(b.id);
      toast.success('Batch archived.');
      loadData();
    } catch {
      toast.error('Failed to archive batch.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Batches & Cohorts"
        subtitle="Schedule cohorts, enforce capacity limits, and manage batch rosters"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Create Batch
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search batches by name or code..."
        className="max-w-md"
      />

      <DataTable
        data={batches}
        columns={[
          {
            header: 'Batch Code',
            accessor: 'batch_code',
            render: (r) => <span className="font-mono text-xs font-bold text-[#4F46E5]">{r.batch_code}</span>,
          },
          {
            header: 'Batch Name',
            accessor: 'name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.course_title}</p>
              </div>
            ),
          },
          { header: 'Instructor', accessor: 'instructor_name' },
          {
            header: 'Schedule',
            render: (r) => (
              <div className="text-xs">
                <p className="font-semibold text-slate-800">{r.class_days}</p>
                <p className="text-slate-500">{r.class_timing}</p>
              </div>
            ),
          },
          {
            header: 'Duration',
            render: (r) => (
              <span className="text-xs">
                {formatDate(r.start_date)} → {formatDate(r.end_date)}
              </span>
            ),
          },
          {
            header: 'Capacity',
            render: (r) => (
              <span className="font-bold">
                {r.enrolled_count} / {r.capacity}
              </span>
            ),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Users}
                  onClick={() => {
                    setRosterBatch(r);
                    setSelectedStudentId(students[0]?.id || '');
                  }}
                >
                  Roster ({r.enrolled_count})
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r);
                    setModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleArchive(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Batch' : 'Create New Batch'}
      >
        <BatchForm
          initialData={editing}
          courses={courses}
          instructors={instructors}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!rosterBatch}
        onClose={() => setRosterBatch(null)}
        title={`Batch Roster — ${rosterBatch?.name || ''}`}
        subtitle={`Enrolled: ${rosterBatch?.enrolled_count || 0} / ${rosterBatch?.capacity || 0} capacity`}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select Student to Add</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </Select>
            </div>
            <Button icon={UserPlus} onClick={handleAddStudent}>
              Assign to Batch
            </Button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
            {(rosterBatch?.students || []).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No students assigned yet.</p>
            ) : (
              rosterBatch.students.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-bold text-slate-900">{s.full_name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveStudent(s.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
