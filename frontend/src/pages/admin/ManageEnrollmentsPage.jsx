import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { batchService } from '../../services/batchService';
import { courseService } from '../../services/courseService';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', course_id: '', batch_id: '', status: 'active' });

  const loadData = async () => {
    try {
      const [eRes, sRes, cRes, bRes] = await Promise.all([
        batchService.listEnrollments(),
        studentService.listStudents(),
        courseService.listCourses(),
        batchService.listBatches(),
      ]);
      setEnrollments(eRes.items || []);
      setStudents(sRes.items || []);
      setCourses(cRes.items || []);
      setBatches(bRes.items || []);
    } catch {
      toast.error('Failed to load enrollments.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await batchService.createEnrollment({
        student_id: Number(form.student_id || students[0]?.id),
        course_id: Number(form.course_id || courses[0]?.id),
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        status: form.status,
      });
      toast.success('Student enrolled successfully!');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed.');
    }
  };

  const handleDelete = async (enr) => {
    const ok = await confirmAction({
      title: `Remove enrollment ${enr.enrollment_number}?`,
    });
    if (!ok) return;
    try {
      await batchService.deleteEnrollment(enr.id);
      toast.success('Enrollment removed.');
      loadData();
    } catch {
      toast.error('Failed to delete enrollment.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Course Enrollments"
        subtitle="Enroll students into courses and cohorts and monitor completion status"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setForm({
                student_id: students[0]?.id || '',
                course_id: courses[0]?.id || '',
                batch_id: '',
                status: 'active',
              });
              setModalOpen(true);
            }}
          >
            New Enrollment
          </Button>
        }
      />

      <DataTable
        data={enrollments}
        columns={[
          {
            header: 'Enrollment #',
            accessor: 'enrollment_number',
            render: (r) => <span className="font-mono text-xs font-bold text-[#4F46E5]">{r.enrollment_number}</span>,
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
          { header: 'Batch', accessor: 'batch_name' },
          {
            header: 'Progress',
            render: (r) => (
              <div className="w-36">
                <ProgressBar value={r.completion_percentage} size="sm" />
              </div>
            ),
          },
          {
            header: 'Enrolled On',
            render: (r) => formatDate(r.enrolled_at),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <button
                type="button"
                onClick={() => handleDelete(r)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enroll Student in Course"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
            onChange={(e) => setForm({ ...form, course_id: e.target.value })}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <Select
            label="Batch (Optional)"
            value={form.batch_id}
            onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
          >
            <option value="">Direct / Self-Paced</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.enrolled_count}/{b.capacity})
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Enrollment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
