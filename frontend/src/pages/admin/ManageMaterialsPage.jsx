import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { API_BASE_URL } from '../../constants';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatBytes, formatDate } from '../../utils/formatters';

export default function ManageMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
  });

  const loadData = async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        courseService.listMaterials(),
        courseService.listCourses(),
      ]);
      setMaterials(mRes.items || []);
      setCourses(cRes.items || []);
    } catch {
      toast.error('Failed to load study materials.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('course_id', String(form.course_id || courses[0]?.id));
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      if (file) {
        fd.append('file', file);
      } else {
        fd.append('external_url', '/uploads/materials/reference_guide.pdf');
      }
      await courseService.uploadMaterial(fd);
      toast.success('Study material uploaded!');
      setModalOpen(false);
      setFile(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (m) => {
    const ok = await confirmAction({ title: `Delete "${m.title}"?` });
    if (!ok) return;
    try {
      await courseService.deleteMaterial(m.id);
      toast.success('Material deleted.');
      loadData();
    } catch {
      toast.error('Failed to delete material.');
    }
  };

  const token = localStorage.getItem('lms_access_token');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials & Resource Library"
        subtitle="Upload PDF handbooks, PPT slide decks, and downloadable course files"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setForm({ course_id: courses[0]?.id || '', title: '', description: '' });
              setFile(null);
              setModalOpen(true);
            }}
          >
            Upload Material
          </Button>
        }
      />

      <DataTable
        data={materials}
        columns={[
          {
            header: 'Resource Title',
            accessor: 'title',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.file_name}</p>
              </div>
            ),
          },
          { header: 'Course', accessor: 'course_title' },
          {
            header: 'Type',
            render: (r) => (
              <span className="uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#4F46E5] text-xs font-bold">
                {r.file_type}
              </span>
            ),
          },
          {
            header: 'Size',
            render: (r) => formatBytes(r.file_size_bytes),
          },
          { header: 'Uploaded By', accessor: 'uploader_name' },
          {
            header: 'Date',
            render: (r) => formatDate(r.created_at),
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-2">
                <a
                  href={`${API_BASE_URL}/materials/${r.id}/download?token=${token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-[#4F46E5] text-xs font-bold hover:bg-indigo-100"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
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
        title="Upload Study Material"
      >
        <form onSubmit={handleUpload} className="space-y-4">
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
            label="Material Title"
            required
            placeholder="Enterprise Microservices Architecture Handbook (PDF)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FileUpload file={file} onFileSelect={setFile} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
