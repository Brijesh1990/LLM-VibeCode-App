import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Video,
  Clock,
  Layers,
  CheckCircle2,
  PlusCircle,
  UserCheck,
  ArrowRight,
  Sparkles,
  CreditCard,
  Lock,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PaymentGatewayModal from '../../components/forms/PaymentGatewayModal';

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('enrolled'); // 'enrolled' | 'catalog'
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal for choosing a batch when enrolling in a course
  const [enrollModalCourse, setEnrollModalCourse] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Dedicated Payment Gateway Modal
  const [gatewayModalCourse, setGatewayModalCourse] = useState(null);
  const [gatewayBatchId, setGatewayBatchId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrRes, crsRes, batRes, catRes] = await Promise.all([
        batchService.listEnrollments(),
        courseService.listCourses({ status: 'published' }),
        batchService.listBatches(),
        courseService.listCategories(),
      ]);
      setEnrollments(enrRes.items || []);
      setAllCourses(crsRes.items || []);
      setBatches(batRes.items || []);
      setCategories(catRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const enrollId = searchParams.get('enroll');
    if (enrollId && allCourses.length > 0) {
      const target = allCourses.find((c) => String(c.id) === String(enrollId));
      if (target) {
        setGatewayModalCourse(target);
      }
    }
  }, [searchParams, allCourses]);

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_id)),
    [enrollments]
  );

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchSearch =
        !search ||
        e.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        e.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        e.instructor_name?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [enrollments, search]);

  const filteredCatalog = useMemo(() => {
    return allCourses.filter((c) => {
      const matchCat = !categoryFilter || String(c.category_id) === String(categoryFilter);
      const matchSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allCourses, categoryFilter, search]);

  const openEnrollModal = (course) => {
    const courseBatches = batches.filter(
      (b) => b.course_id === course.id && b.status !== 'closed' && b.status !== 'archived' && b.available_seats > 0
    );
    setEnrollModalCourse(course);
    setSelectedBatchId(courseBatches[0]?.id ? String(courseBatches[0].id) : '');
  };

  const handleConfirmEnrollment = async (e) => {
    e.preventDefault();
    if (!enrollModalCourse) return;
    try {
      setEnrolling(true);
      await batchService.createEnrollment({
        student_id: user?.id,
        course_id: enrollModalCourse.id,
        batch_id: selectedBatchId ? Number(selectedBatchId) : null,
        status: 'active',
      });
      toast.success(`Successfully enrolled in ${enrollModalCourse.title}!`);
      setEnrollModalCourse(null);
      await loadData();
      setActiveTab('enrolled');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not complete enrollment.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <Loader text="Loading your courses and institute catalog..." />;
  }

  const availableBatchesForSelectedCourse = enrollModalCourse
    ? batches.filter(
        (b) =>
          b.course_id === enrollModalCourse.id &&
          b.status !== 'closed' &&
          b.status !== 'archived'
      )
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses & Academic Catalog"
        subtitle="Manage your enrolled courses, track module completion, or enroll in new courses."
        actions={
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('enrolled')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'enrolled'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Enrolled Courses ({enrollments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Catalog ({allCourses.length})
            </button>
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by course title, code, or instructor..."
          className="w-full sm:w-96"
        />
        {activeTab === 'catalog' && (
          <div className="w-full sm:w-64">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {activeTab === 'enrolled' ? (
        filteredEnrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No enrolled courses match your filter"
            description="Switch to the Available Catalog tab to one-click enroll in a new course."
            action={
              <Button icon={Sparkles} onClick={() => setActiveTab('catalog')}>
                Browse Available Catalog
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEnrollments.map((enr) => {
              const courseObj = allCourses.find((c) => c.id === enr.course_id);
              return (
                <div
                  key={enr.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="h-2 bg-gradient-to-r from-[#4F46E5] via-[#06B6D4] to-[#8B5CF6]" />
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="indigo">{enr.course_code || `CRS-${enr.course_id}`}</Badge>
                        <StatusBadge status={enr.status} />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1">
                        {enr.course_title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {courseObj?.description ||
                          'Complete video lectures, study materials, assignments, and quizzes to earn your certificate.'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
                          <span className="truncate">{enr.instructor_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span className="truncate">{enr.batch_name}</span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <ProgressBar
                          value={enr.completion_percentage || 0}
                          label="Completion Progress"
                          color={enr.completion_percentage >= 75 ? 'emerald' : 'indigo'}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Enrolled {formatDate(enr.enrolled_at)}
                    </span>
                    <Button
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => navigate(`/student/course/${enr.course_id}`)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredCatalog.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No catalog courses found"
          description="Try clearing your search or category filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCatalog.map((course) => {
            const isAlreadyEnrolled = enrolledCourseIds.has(course.id);
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="violet">{course.category_name}</Badge>
                    <Badge variant="slate">{course.level?.toUpperCase()}</Badge>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">{course.title}</h3>
                  <p className="text-xs font-semibold text-[#4F46E5] mt-0.5">{course.course_code}</p>
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3">{course.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.duration_weeks}w ({course.duration_hours}h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.lectures_count || 0} Lectures</span>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">
                      {formatCurrency(course.fee)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    Instructor: <strong className="text-slate-700">{course.instructor_name}</strong>
                  </span>
                  {isAlreadyEnrolled ? (
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckCircle2}
                      onClick={() => navigate(`/student/course/${course.id}`)}
                    >
                      Enrolled • Open
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Layers}
                        onClick={() => openEnrollModal(course)}
                      >
                        Cohort
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={CreditCard}
                        onClick={() => {
                          setGatewayModalCourse(course);
                          setGatewayBatchId(null);
                        }}
                      >
                        Buy with Test Key
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* One-Click Enrollment Modal */}
      <Modal
        isOpen={!!enrollModalCourse}
        onClose={() => setEnrollModalCourse(null)}
        title={`Enroll in ${enrollModalCourse?.title || 'Course'}`}
        subtitle="Select your preferred cohort batch to confirm instant enrollment"
        size="md"
      >
        {enrollModalCourse && (
          <form onSubmit={handleConfirmEnrollment} className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="indigo">{enrollModalCourse.course_code}</Badge>
                <span className="text-sm font-extrabold text-slate-900">
                  Course Fee: {formatCurrency(enrollModalCourse.fee)}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">{enrollModalCourse.title}</h4>
              <p className="text-xs text-slate-600">
                Instructor: {enrollModalCourse.instructor_name} • Duration: {enrollModalCourse.duration_weeks} Weeks
              </p>
            </div>

            <Select
              label="Select Cohort Batch (Optional)"
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
            >
              <option value="">Direct / Self-Paced Cohort</option>
              {availableBatchesForSelectedCourse.map((b) => (
                <option key={b.id} value={b.id} disabled={b.available_seats <= 0}>
                  {b.name} ({b.class_days} • {b.class_timing}) — {b.available_seats} seats left
                </option>
              ))}
            </Select>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="primary"
                icon={CreditCard}
                onClick={() => {
                  const targetCourse = enrollModalCourse;
                  const chosenBatch = selectedBatchId;
                  setEnrollModalCourse(null);
                  setGatewayModalCourse(targetCourse);
                  setGatewayBatchId(chosenBatch);
                }}
                className="w-full sm:w-auto"
              >
                Pay via Gateway (Test Key)
              </Button>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={() => setEnrollModalCourse(null)}>
                  Cancel
                </Button>
                <Button type="submit" loading={enrolling} icon={CheckCircle2}>
                  Direct Enroll
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Secure Payment Gateway Checkout Modal */}
      <PaymentGatewayModal
        isOpen={!!gatewayModalCourse}
        onClose={() => setGatewayModalCourse(null)}
        course={gatewayModalCourse}
        batchId={gatewayBatchId}
        batchName={batches.find((b) => String(b.id) === String(gatewayBatchId))?.name || ''}
        onSuccess={async () => {
          setGatewayModalCourse(null);
          await loadData();
          setActiveTab('enrolled');
        }}
      />
    </div>
  );
}
