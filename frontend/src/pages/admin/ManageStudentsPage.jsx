import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import StudentForm from '../../components/forms/StudentForm';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { exportTableToPDF } from '../../utils/formatters';

export default function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadStudents = async () => {
    try {
      const res = await studentService.listStudents({ search });
      setStudents(res.items || []);
    } catch {
      toast.error('Failed to load students.');
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) {
        await studentService.updateStudent(editing.id, payload);
        toast.success('Student record updated!');
      } else {
        await studentService.createStudent(payload);
        toast.success('Student added successfully!');
      }
      setModalOpen(false);
      setEditing(null);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stu) => {
    const ok = await confirmAction({
      title: `Deactivate ${stu.full_name}?`,
      text: 'This student account will be deactivated and archived.',
    });
    if (!ok) return;
    try {
      await studentService.deleteStudent(stu.id);
      toast.success('Student deactivated.');
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed.');
    }
  };

  const handleExportPDF = () => {
    exportTableToPDF(
      'Student Directory & Academic Roster',
      ['Student Code', 'Full Name', 'Email', 'Phone', 'Courses', 'Avg Progress %', 'Attendance %'],
      students.map((s) => [
        s.student_code,
        s.full_name,
        s.email,
        s.phone,
        s.enrolled_courses_count || 0,
        `${s.avg_progress || 0}%`,
        `${s.attendance_percentage || 100}%`,
      ]),
      'nexuslms_students.pdf'
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Students"
        subtitle="Add, edit, search, and monitor enrolled students across all cohorts"
        actions={
          <>
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add Student
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search students by name, email, phone, or student code..."
          className="max-w-md w-full"
        />
      </div>

      <DataTable
        data={students}
        columns={[
          {
            header: 'Student ID',
            accessor: 'student_code',
            render: (r) => <span className="font-mono text-xs font-bold text-[#4F46E5]">{r.student_code}</span>,
          },
          {
            header: 'Student Name',
            accessor: 'full_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.full_name}</p>
                <p className="text-xs text-slate-500">{r.email}</p>
              </div>
            ),
          },
          { header: 'Phone', accessor: 'phone' },
          {
            header: 'Enrolled Courses',
            accessor: 'enrolled_courses_count',
            render: (r) => <span className="font-bold">{r.enrolled_courses_count || 0}</span>,
          },
          {
            header: 'Course Progress',
            render: (r) => (
              <div className="w-32">
                <ProgressBar value={r.avg_progress || 0} size="sm" />
              </div>
            ),
          },
          {
            header: 'Attendance',
            render: (r) => (
              <span className="font-bold text-emerald-700">{r.attendance_percentage ?? 100}%</span>
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
        title={editing ? 'Edit Student Record' : 'Register New Student'}
      >
        <StudentForm
          initialData={editing}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
