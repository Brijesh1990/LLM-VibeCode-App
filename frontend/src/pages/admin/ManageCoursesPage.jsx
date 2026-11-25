import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { instructorService } from '../../services/instructorService';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import CourseForm from '../../components/forms/CourseForm';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatCurrency } from '../../utils/formatters';

export default function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [cRes, catRes, insRes] = await Promise.all([
        courseService.listCourses({
          search: search || undefined,
          category_id: categoryId || undefined,
          status: statusFilter || undefined,
        }),
        courseService.listCategories(),
        instructorService.listInstructors(),
      ]);
      setCourses(cRes.items || []);
      setCategories(catRes.items || []);
      setInstructors(insRes.items || []);
    } catch {
      toast.error('Failed to load courses.');
    }
  };

  useEffect(() => {
    loadData();
  }, [search, categoryId, statusFilter]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const cleaned = {
        ...payload,
        instructor_id: payload.instructor_id ? Number(payload.instructor_id) : null,
      };
      if (editing) {
        await courseService.updateCourse(editing.id, cleaned);
        toast.success('Course updated!');
      } else {
        await courseService.createCourse(cleaned);
        toast.success('Course created!');
      }
      setModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    const ok = await confirmAction({
      title: `Delete or Archive "${course.title}"?`,
      text: 'Courses with active student enrollments are safely archived.',
    });
    if (!ok) return;
    try {
      const res = await courseService.deleteCourse(course.id);
      toast.success(res.message || 'Course archived.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Courses"
        subtitle="Create, publish, filter, and assign instructors to academic courses"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Create Course
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search courses by title, code, or syllabus..."
          className="max-w-md w-full"
        />
        <div className="w-52">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, idx) => {
          const fallbackImages = [
            '/images/course-fullstack.svg',
            '/images/course-genai.svg',
            '/images/course-cloud.svg',
            '/images/course-design.svg',
          ];
          const thumb = course.thumbnail_url || fallbackImages[idx % fallbackImages.length];
          return (
          <div
            key={course.id}
            data-aos="fade-up"
            data-aos-delay={idx * 50}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="h-40 w-full bg-slate-900 overflow-hidden relative">
                <img src={thumb} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 pb-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5]">
                  {course.category_name}
                </span>
                <StatusBadge status={course.status} />
              </div>
              <p className="text-xs font-mono font-bold text-slate-400">{course.course_code}</p>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{course.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">{course.description}</p>
              </div>
            </div>

            <div className="p-5 pt-4 mt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Instructor: <strong>{course.instructor_name}</strong></span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency(course.fee)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {course.duration_weeks}w • {course.lectures_count} Lectures
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {course.enrollments_count} Students
                </span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    setEditing(course);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(course)}
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Course' : 'Create New Course'}
      >
        <CourseForm
          initialData={editing}
          categories={categories}
          instructors={instructors}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      </Modal>
    </div>
  );
}
