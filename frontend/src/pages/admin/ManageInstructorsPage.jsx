import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { instructorService } from '../../services/instructorService';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import InstructorForm from '../../components/forms/InstructorForm';
import { confirmAction } from '../../components/common/ConfirmDialog';

export default function ManageInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadInstructors = async () => {
    try {
      const res = await instructorService.listInstructors({ search });
      setInstructors(res.items || []);
    } catch {
      toast.error('Failed to load instructors.');
    }
  };

  useEffect(() => {
    loadInstructors();
  }, [search]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await instructorService.updateInstructor(editing.id, payload);
        toast.success('Instructor updated!');
      } else {
        await instructorService.createInstructor(payload);
        toast.success('Instructor added!');
      }
      setModalOpen(false);
      setEditing(null);
      loadInstructors();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save instructor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ins) => {
    const ok = await confirmAction({
      title: `Deactivate ${ins.full_name}?`,
      text: 'This faculty profile will be archived.',
    });
    if (!ok) return;
    try {
      await instructorService.deleteInstructor(ins.id);
      toast.success('Instructor deactivated.');
      loadInstructors();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Instructors"
        subtitle="Manage faculty profiles, specializations, and course assignments"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add Instructor
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search instructors by name or email..."
        className="max-w-md"
      />

      <DataTable
        data={instructors}
        columns={[
          {
            header: 'Code',
            accessor: 'employee_code',
            render: (r) => <span className="font-mono text-xs font-bold text-[#06B6D4]">{r.employee_code}</span>,
          },
          {
            header: 'Faculty Member',
            accessor: 'full_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.full_name}</p>
                <p className="text-xs text-slate-500">{r.email}</p>
              </div>
            ),
          },
          { header: 'Department', accessor: 'department' },
          { header: 'Specialization', accessor: 'specialization' },
          {
            header: 'Experience',
            render: (r) => <span>{r.experience_years} yrs</span>,
          },
          {
            header: 'Assigned Load',
            render: (r) => (
              <span className="text-xs font-semibold">
                {r.assigned_courses_count || 0} Courses • {r.assigned_batches_count || 0} Batches
              </span>
            ),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.is_active ? 'active' : 'closed'} />,
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
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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
        title={editing ? 'Edit Faculty Profile' : 'Add New Instructor'}
      >
        <InstructorForm
          initialData={editing}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
