import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Layers,
  Video,
  FileCheck2,
  BrainCircuit,
  FileText,
  Plus,
  Edit3,
  Trash2,
  GraduationCap,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modules Management Modal State
  const [activeCourse, setActiveCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [modTitle, setModTitle] = useState('');
  const [modDescription, setModDescription] = useState('');
  const [modOrder, setModOrder] = useState(1);
  const [savingModule, setSavingModule] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.listCourses({ instructor_id: user?.id });
      setCourses(res.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load assigned courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCourses();
    }
  }, [user?.id]);

  const openModulesManager = async (course) => {
    setActiveCourse(course);
    setEditingModule(null);
    setModTitle('');
    setModDescription('');
    try {
      setLoadingModules(true);
      const res = await courseService.listModules({ course_id: course.id });
      const items = res.items || [];
      setModules(items);
      setModOrder(items.length + 1);
    } catch {
      toast.error('Failed to load course modules');
    } finally {
      setLoadingModules(false);
    }
  };

  const handleEditModuleClick = (mod) => {
    setEditingModule(mod);
    setModTitle(mod.title);
    setModDescription(mod.description || '');
    setModOrder(mod.sort_order || 1);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!activeCourse || !modTitle.trim()) return;
    try {
      setSavingModule(true);
      const payload = {
        course_id: activeCourse.id,
        title: modTitle.trim(),
        description: modDescription.trim(),
        sort_order: Number(modOrder || 1),
        is_published: true,
      };
      if (editingModule) {
        await courseService.updateModule(editingModule.id, payload);
        toast.success('Module updated!');
      } else {
        await courseService.createModule(payload);
        toast.success('New syllabus module added!');
      }
      const res = await courseService.listModules({ course_id: activeCourse.id });
      const items = res.items || [];
      setModules(items);
      setEditingModule(null);
      setModTitle('');
      setModDescription('');
      setModOrder(items.length + 1);
      await loadCourses();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to save module');
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!activeCourse) return;
    try {
      await courseService.deleteModule(modId);
      toast.success('Module deleted');
      const res = await courseService.listModules({ course_id: activeCourse.id });
      setModules(res.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete module');
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.category_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  if (loading) {
    return <Loader text="Loading your assigned courses and curricula..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Courses & Syllabus Modules"
        subtitle="Manage curriculum modules and jump directly to lectures, materials, assignments, and quizzes for your assigned courses."
        badge={<Badge variant="indigo">{courses.length} Assigned Courses</Badge>}
      />

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search your assigned courses by title, code, or category..."
          className="w-full sm:w-96"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assigned courses found"
          description="Courses assigned to you by the institute administrator will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{course.course_code}</Badge>
                    <Badge variant="violet">{course.category_name}</Badge>
                  </div>
                  <StatusBadge status={course.status} />
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>

                {/* Metrics Bar */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="text-slate-400">Students</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {course.enrollments_count ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Modules</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {(course.modules || []).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Lectures</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {course.lectures_count ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Batches</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {course.batches_count ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={Layers}
                  onClick={() => openModulesManager(course)}
                >
                  Manage Modules ({(course.modules || []).length})
                </Button>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Video}
                    onClick={() => navigate('/instructor/lectures')}
                  >
                    Lectures
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FileText}
                    onClick={() => navigate('/instructor/materials')}
                  >
                    Materials
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FileCheck2}
                    onClick={() => navigate('/instructor/assignments')}
                  >
                    Assignments
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={BrainCircuit}
                    onClick={() => navigate('/instructor/quizzes')}
                  >
                    Quizzes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modules Management Modal */}
      <Modal
        isOpen={!!activeCourse}
        onClose={() => setActiveCourse(null)}
        title={`Manage Syllabus Modules — ${activeCourse?.title || ''}`}
        subtitle="Add, reorder, or edit syllabus modules for this course"
        size="lg"
      >
        {activeCourse && (
          <div className="space-y-6">
            <form
              onSubmit={handleSaveModule}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {editingModule ? `Editing Module: ${editingModule.title}` : 'Add New Syllabus Module'}
                </h4>
                {editingModule && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingModule(null);
                      setModTitle('');
                      setModDescription('');
                      setModOrder(modules.length + 1);
                    }}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <Input
                    label="Module Title"
                    required
                    placeholder="e.g., Module 1: System Architecture & Foundations"
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Sort Order"
                    type="number"
                    min="1"
                    required
                    value={modOrder}
                    onChange={(e) => setModOrder(e.target.value)}
                  />
                </div>
              </div>

              <Textarea
                label="Module Learning Objectives / Summary"
                rows={2}
                placeholder="Key topics covered in this module..."
                value={modDescription}
                onChange={(e) => setModDescription(e.target.value)}
              />

              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={savingModule} icon={Plus}>
                  {editingModule ? 'Update Module' : 'Add Module'}
                </Button>
              </div>
            </form>

            {/* Existing Modules List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Course Modules ({modules.length})
              </h4>
              {loadingModules ? (
                <p className="text-xs text-slate-500 py-4 text-center">Loading modules...</p>
              ) : modules.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No modules created for this course yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                  {modules.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-white flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="indigo">#{m.sort_order}</Badge>
                          <span className="text-sm font-bold text-slate-900">{m.title}</span>
                        </div>
                        {m.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Edit3}
                          onClick={() => handleEditModuleClick(m)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteModule(m.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
