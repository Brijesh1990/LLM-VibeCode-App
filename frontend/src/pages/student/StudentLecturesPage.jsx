import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Video, Play, CheckCircle2, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentLecturesPage() {
  const [lectures, setLectures] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeLecture, setActiveLecture] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadLectures = async () => {
    try {
      setLoading(true);
      const [lecRes, enrRes] = await Promise.all([
        courseService.listLectures(),
        batchService.listEnrollments(),
      ]);
      setLectures(lecRes.items || []);
      setEnrollments(enrRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load video lectures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  const handleToggleComplete = async (lecture) => {
    try {
      setTogglingId(lecture.id);
      const nextCompleted = !lecture.is_completed;
      await courseService.completeLecture(lecture.id, nextCompleted);
      setLectures((prev) =>
        prev.map((l) => (l.id === lecture.id ? { ...l, is_completed: nextCompleted } : l))
      );
      if (activeLecture?.id === lecture.id) {
        setActiveLecture((prev) => (prev ? { ...prev, is_completed: nextCompleted } : null));
      }
      toast.success(
        nextCompleted
          ? `Marked "${lecture.title}" as completed!`
          : `Marked "${lecture.title}" as incomplete.`
      );
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update lecture status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredLectures = useMemo(() => {
    return lectures.filter((l) => {
      const matchCourse = !courseFilter || String(l.course_id) === String(courseFilter);
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'completed' && l.is_completed) ||
        (statusFilter === 'pending' && !l.is_completed);
      const matchSearch =
        !search ||
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        l.module_title?.toLowerCase().includes(search.toLowerCase());
      return matchCourse && matchStatus && matchSearch;
    });
  }, [lectures, courseFilter, statusFilter, search]);

  const completedCount = lectures.filter((l) => l.is_completed).length;
  const overallLecturePct = lectures.length > 0 ? (completedCount / lectures.length) * 100 : 0;

  if (loading) {
    return <Loader text="Loading your video lectures..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Video Lectures"
        subtitle="Stream full HD syllabus lectures and track real-time completion progress across your courses."
        badge={<Badge variant="indigo">{completedCount}/{lectures.length} Completed</Badge>}
      />

      {/* Lecture Completion Progress Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <ProgressBar
          value={overallLecturePct}
          label={`Overall Video Lecture Completion (${completedCount} of ${lectures.length} watched)`}
          color={overallLecturePct >= 75 ? 'emerald' : 'indigo'}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search lectures by title or module..."
        />
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Enrolled Courses</option>
          {enrollments.map((e) => (
            <option key={e.course_id} value={e.course_id}>
              {e.course_title}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Completion States</option>
          <option value="completed">Completed Lectures</option>
          <option value="pending">Pending Lectures</option>
        </Select>
      </div>

      {/* Lectures Cards Grid */}
      {filteredLectures.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No video lectures found"
          description="Try adjusting your course filter or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLectures.map((lec) => (
            <div
              key={lec.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="indigo">{lec.course_title}</Badge>
                  <Badge variant={lec.is_completed ? 'green' : 'amber'}>
                    {lec.is_completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>

                <div
                  onClick={() => setActiveLecture(lec)}
                  className="group relative rounded-xl bg-slate-900 h-36 mb-4 flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-violet-600/30 group-hover:opacity-80 transition-opacity" />
                  <div className="w-12 h-12 rounded-full bg-white/95 text-[#4F46E5] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-10">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-semibold">
                    {lec.duration_minutes} mins
                  </span>
                </div>

                <p className="text-xs font-semibold text-[#06B6D4] uppercase tracking-wider">
                  {lec.module_title}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{lec.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lec.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Play}
                  onClick={() => setActiveLecture(lec)}
                >
                  Watch Player
                </Button>
                <Button
                  size="sm"
                  variant={lec.is_completed ? 'success' : 'primary'}
                  icon={CheckCircle2}
                  loading={togglingId === lec.id}
                  onClick={() => handleToggleComplete(lec)}
                >
                  {lec.is_completed ? 'Completed' : 'Mark Complete'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <Modal
        isOpen={!!activeLecture}
        onClose={() => setActiveLecture(null)}
        title={activeLecture?.title || 'Lecture Player'}
        subtitle={`${activeLecture?.course_title || ''} • ${activeLecture?.module_title || ''}`}
        size="xl"
      >
        {activeLecture && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              {activeLecture.video_url?.includes('youtube.com') ||
              activeLecture.video_url?.includes('youtu.be') ||
              activeLecture.video_url?.includes('embed') ? (
                <iframe
                  src={activeLecture.video_url.replace('watch?v=', 'embed/')}
                  title={activeLecture.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="text-center p-8 text-white space-y-3">
                  <Video className="w-12 h-12 text-indigo-400 mx-auto" />
                  <h4 className="text-lg font-bold">{activeLecture.title}</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    {activeLecture.description}
                  </p>
                  {activeLecture.video_url && (
                    <a
                      href={activeLecture.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-indigo-500"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Video Stream
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{activeLecture.title}</p>
                <p className="text-xs text-slate-500">{activeLecture.description}</p>
              </div>
              <Button
                variant={activeLecture.is_completed ? 'success' : 'primary'}
                icon={CheckCircle2}
                loading={togglingId === activeLecture.id}
                onClick={() => handleToggleComplete(activeLecture)}
              >
                {activeLecture.is_completed ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
