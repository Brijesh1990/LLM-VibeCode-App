import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import { confirmAction } from '../../components/common/ConfirmDialog';

export default function ManageLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    course_id: '',
    module_id: '',
    batch_id: '',
    title: '',
    description: '',
    video_url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    duration_minutes: 45,
    sort_order: 1,
    is_published: true,
  });

  const loadData = async () => {
    try {
      const [lRes, cRes, mRes, bRes] = await Promise.all([
        courseService.listLectures({ course_id: courseFilter || undefined }),
        courseService.listCourses(),
        courseService.listModules(),
        batchService.listBatches(),
      ]);
      setLectures(lRes.items || []);
      setCourses(cRes.items || []);
      setModules(mRes.items || []);
      setBatches(bRes.items || []);
    } catch {
      toast.error('Failed to load lectures.');
    }
  };

  useEffect(() => {
    loadData();
  }, [courseFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        course_id: Number(form.course_id || courses[0]?.id),
        module_id: form.module_id ? Number(form.module_id) : null,
        batch_id: form.batch_id ? Number(form.batch_id) : null,
        duration_minutes: Number(form.duration_minutes),
        sort_order: Number(form.sort_order),
      };
      if (editing) {
        await courseService.updateLecture(editing.id, payload);
        toast.success('Lecture updated!');
      } else {
        await courseService.createLecture(payload);
        toast.success('Lecture published!');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save lecture.');
    }
  };

  const handleDelete = async (lec) => {
    const ok = await confirmAction({ title: `Delete lecture "${lec.title}"?` });
    if (!ok) return;
    try {
      await courseService.deleteLecture(lec.id);
      toast.success('Lecture deleted.');
      loadData();
    } catch {
      toast.error('Failed to delete lecture.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Lectures & Video Sessions"
        subtitle="Create, order, and publish video lectures across modules and cohorts"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setForm({
                course_id: courses[0]?.id || '',
                module_id: '',
                batch_id: '',
                title: '',
                description: '',
                video_url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
                duration_minutes: 50,
                sort_order: lectures.length + 1,
                is_published: true,
              });
              setModalOpen(true);
            }}
          >
            Add Lecture
          </Button>
        }
      />

      <div className="max-w-xs">
        <Select
          label="Filter by Course"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
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
        data={lectures}
        columns={[
          { header: '#', accessor: 'sort_order' },
          {
            header: 'Lecture Title',
            accessor: 'title',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.module_title}</p>
              </div>
            ),
          },
          { header: 'Course', accessor: 'course_title' },
          {
            header: 'Duration',
            render: (r) => <span>{r.duration_minutes} mins</span>,
          },
          {
            header: 'Video Link',
            render: (r) =>
              r.video_url ? (
                <a
                  href={r.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:underline"
                >
                  Watch Video <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                '—'
              ),
          },
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
                      module_id: r.module_id || '',
                      batch_id: r.batch_id || '',
                      title: r.title,
                      description: r.description,
                      video_url: r.video_url,
                      duration_minutes: r.duration_minutes,
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
        title={editing ? 'Edit Lecture' : 'Publish New Lecture'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Course Module (Optional)"
              value={form.module_id}
              onChange={(e) => setForm({ ...form, module_id: e.target.value })}
            >
              <option value="">General Module</option>
              {modules
                .filter((m) => !form.course_id || Number(m.course_id) === Number(form.course_id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
            </Select>
          </div>
          <Input
            label="Lecture Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Lecture Summary / Notes"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Video Stream URL"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              />
            </div>
            <Input
              label="Duration (Minutes)"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Update Lecture' : 'Create Lecture'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
