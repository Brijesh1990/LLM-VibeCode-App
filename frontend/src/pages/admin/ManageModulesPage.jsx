import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import { confirmAction } from '../../components/common/ConfirmDialog';

export default function ManageModulesPage() {
  const [modules, setModules] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    sort_order: 1,
    is_published: true,
  });

  const loadData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        courseService.listModules({ course_id: courseId || undefined }),
        courseService.listCourses(),
      ]);
      setModules(mRes.items || []);
      setCourses(cRes.items || []);
    } catch {
      toast.error('Failed to load course modules.');
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        course_id: Number(form.course_id || courses[0]?.id),
        sort_order: Number(form.sort_order),
      };
      if (editing) {
        await courseService.updateModule(editing.id, payload);
        toast.success('Module updated!');
      } else {
        await courseService.createModule(payload);
        toast.success('Module created!');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed.');
    }
  };

  const handleDelete = async (m) => {
    const ok = await confirmAction({ title: `Delete "${m.title}"?` });
    if (!ok) return;
    try {
      await courseService.deleteModule(m.id);
      toast.success('Module deleted.');
      loadData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Modules & Syllabus Units"
        subtitle="Structure course curricula into ordered learning modules"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setForm({
                course_id: courses[0]?.id || '',
                title: '',
                description: '',
                sort_order: modules.length + 1,
                is_published: true,
              });
              setModalOpen(true);
            }}
          >
            Add Module
          </Button>
        }
      />

      <div className="max-w-xs">
        <Select
          label="Filter by Course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      <DataTable
        data={modules}
        columns={[
          { header: 'Order', accessor: 'sort_order' },
          {
            header: 'Module Title',
            accessor: 'title',
            render: (r) => <span className="font-bold text-slate-900">{r.title}</span>,
          },
          { header: 'Course', accessor: 'course_title' },
          { header: 'Description', accessor: 'description' },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.is_published ? 'published' : 'draft'} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r);
                    setForm({
                      course_id: r.course_id,
                      title: r.title,
                      description: r.description,
                      sort_order: r.sort_order,
                      is_published: r.is_published,
                    });
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
        title={editing ? 'Edit Course Module' : 'Create Course Module'}
      >
        <form onSubmit={handleSave} className="space-y-4">
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
          <Input
            label="Module Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Sort Order"
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
