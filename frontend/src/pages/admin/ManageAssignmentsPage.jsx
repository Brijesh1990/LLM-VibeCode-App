import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import AssignmentForm from '../../components/forms/AssignmentForm';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/formatters';

export default function ManageAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [aRes, cRes, bRes] = await Promise.all([
        assignmentService.listAssignments(),
        courseService.listCourses(),
        batchService.listBatches(),
      ]);
      setAssignments(aRes.items || []);
      setCourses(cRes.items || []);
      setBatches(bRes.items || []);
    } catch {
      toast.error('Failed to load assignments.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await assignmentService.updateAssignment(editing.id, payload);
        toast.success('Assignment updated!');
      } else {
        await assignmentService.createAssignment(payload);
        toast.success('Assignment published!');
      }
      setModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a) => {
    const ok = await confirmAction({ title: `Delete assignment "${a.title}"?` });
    if (!ok) return;
    try {
      await assignmentService.deleteAssignment(a.id);
      toast.success('Assignment deleted.');
      loadData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Assignments"
        subtitle="Create coursework assignments, set deadlines, and configure maximum marks"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Create Assignment
          </Button>
        }
      />

      <DataTable
        data={assignments}
        columns={[
          {
            header: 'Assignment Title',
            accessor: 'title',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{r.description}</p>
              </div>
            ),
          },
          { header: 'Course', accessor: 'course_title' },
          { header: 'Batch', accessor: 'batch_name' },
          {
            header: 'Marks',
            render: (r) => (
              <span className="font-semibold">
                {r.passing_marks} / {r.max_marks}
              </span>
            ),
          },
          {
            header: 'Due Date',
            render: (r) => formatDateTime(r.due_date),
          },
          {
            header: 'Submissions',
            accessor: 'submissions_count',
            render: (r) => (
              <span className="font-bold text-[#4F46E5]">{r.submissions_count} Submitted</span>
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
                  onClick={() => handleDelete(r)}
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
        title={editing ? 'Edit Assignment' : 'Create Assignment'}
      >
        <AssignmentForm
          initialData={editing}
          courses={courses}
          batches={batches}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
