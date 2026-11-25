import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Video,
  FileText,
  FileCheck2,
  BrainCircuit,
  CheckCircle2,
  Circle,
  Download,
  Play,
  ArrowLeft,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { assignmentService } from '../../services/assignmentService';
import { quizService } from '../../services/quizService';
import { studentService } from '../../services/studentService';
import { API_BASE_URL } from '../../constants';
import { formatDate, formatBytes } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentCourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = Number(id);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [crs, modRes, lecRes, matRes, asgRes, qzRes, progRes] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.listModules({ course_id: courseId }),
        courseService.listLectures({ course_id: courseId }),
        courseService.listMaterials({ course_id: courseId }),
        assignmentService.listAssignments({ course_id: courseId }),
        quizService.listQuizzes({ course_id: courseId }),
        studentService.getProgress({ course_id: courseId }),
      ]);
      setCourse(crs);
      setModules(modRes.items || []);
      setLectures(lecRes.items || []);
      setMaterials(matRes.items || []);
      setAssignments(asgRes.items || []);
      setQuizzes(qzRes.items || []);
      setCourseProgress((progRes.items || [])[0] || null);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleToggleLectureComplete = async (lecture) => {
    try {
      setTogglingId(lecture.id);
      const nextState = !lecture.is_completed;
      const res = await courseService.completeLecture(lecture.id, nextState);
      setLectures((prev) =>
        prev.map((l) => (l.id === lecture.id ? { ...l, is_completed: nextState } : l))
      );
      if (res.course_progress) {
        setCourseProgress((prev) => ({ ...prev, ...res.course_progress }));
      }
      toast.success(
        nextState ? `Marked "${lecture.title}" as completed!` : 'Marked lecture as incomplete.'
      );
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not update lecture completion.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading course syllabus, lectures, and assessments..." />;
  }

  if (!course) {
    return (
      <EmptyState
        title="Course Not Found"
        description="The requested course could not be loaded."
        action={<Button onClick={() => navigate('/student/courses')}>Back to My Courses</Button>}
      />
    );
  }

  const token = localStorage.getItem('lms_access_token');
  const completionPct = courseProgress?.completion_percentage ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={course.title}
        subtitle={`${course.course_code} • Instructor: ${course.instructor_name} • ${course.duration_weeks} Weeks (${course.duration_hours} Hours)`}
        badge={<StatusBadge status={course.status} />}
        actions={
          <>
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/student/courses')}>
              Back to Courses
            </Button>
            {courseProgress?.is_eligible_for_certificate && (
              <Button
                variant="accent"
                icon={Award}
                onClick={() => navigate('/student/certificates')}
              >
                Claim Certificate
              </Button>
            )}
          </>
        }
      />

      {/* Course Overview & Live Progress Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo">{course.category_name}</Badge>
              <Badge variant="cyan">Level: {course.level?.toUpperCase()}</Badge>
              <Badge variant="violet">
                Certificate Threshold: {course.completion_threshold_pct}%
              </Badge>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <ProgressBar
              value={completionPct}
              label="Your Real-Time Course Completion"
              color={completionPct >= course.completion_threshold_pct ? 'emerald' : 'indigo'}
              size="lg"
            />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-slate-500">Lectures</p>
                <p className="font-bold text-slate-900">
                  {courseProgress?.completed_lectures ?? 0}/{courseProgress?.total_lectures ?? lectures.length}
                </p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-slate-500">Assignments</p>
                <p className="font-bold text-slate-900">
                  {courseProgress?.submitted_assignments ?? 0}/{courseProgress?.total_assignments ?? assignments.length}
                </p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-100">
                <p className="text-slate-500">Quizzes</p>
                <p className="font-bold text-slate-900">
                  {courseProgress?.completed_quizzes ?? 0}/{courseProgress?.total_quizzes ?? quizzes.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Modules & Video Lectures */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#4F46E5]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Course Syllabus & Video Lectures</h3>
              <p className="text-xs text-slate-500">
                Watch lectures and toggle completion to update your academic progress
              </p>
            </div>
          </div>
          <Badge variant="indigo">{lectures.length} Lectures</Badge>
        </div>

        {modules.length === 0 && lectures.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No lectures published yet"
            description="The instructor has not uploaded syllabus lectures for this course yet."
          />
        ) : (
          <div className="space-y-4">
            {(modules.length > 0
              ? modules
              : [{ id: 0, title: 'Core Curriculum Lectures', description: '' }]
            ).map((mod) => {
              const modLectures =
                modules.length > 0
                  ? lectures.filter((l) => l.module_id === mod.id || (!l.module_id && mod.id === modules[0]?.id))
                  : lectures;
              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                      {mod.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                      )}
                    </div>
                    <Badge variant="slate">{modLectures.length} Lectures</Badge>
                  </div>

                  {modLectures.length === 0 ? (
                    <p className="p-4 text-xs text-slate-400">No lectures in this module.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {modLectures.map((lec) => (
                        <div
                          key={lec.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLectureComplete(lec)}
                              disabled={togglingId === lec.id}
                              className="mt-0.5 text-[#4F46E5] hover:scale-110 transition-transform cursor-pointer"
                              title="Toggle lecture completion"
                            >
                              {lec.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{lec.title}</span>
                                {lec.is_completed && <Badge variant="green">Completed</Badge>}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{lec.description}</p>
                              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> {lec.duration_minutes} mins
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Play}
                              onClick={() => setActiveLecture(lec)}
                            >
                              Watch Video
                            </Button>
                            <Button
                              size="sm"
                              variant={lec.is_completed ? 'success' : 'primary'}
                              loading={togglingId === lec.id}
                              icon={CheckCircle2}
                              onClick={() => handleToggleLectureComplete(lec)}
                            >
                              {lec.is_completed ? 'Completed' : 'Mark Complete'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Study Materials, Assignments, and Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Materials */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              <h3 className="text-base font-bold text-slate-900">Study Materials</h3>
            </div>
            <Badge variant="violet">{materials.length}</Badge>
          </div>
          {materials.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No study materials uploaded.</p>
          ) : (
            <div className="space-y-3">
              {materials.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{m.title}</p>
                    <p className="text-xs text-slate-500">
                      {m.file_type?.toUpperCase()} • {formatBytes(m.file_size_bytes)}
                    </p>
                  </div>
                  <a
                    href={`${API_BASE_URL}/materials/${m.id}/download?token=${token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-[#4F46E5] hover:bg-indigo-100 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Assignments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Assignments</h3>
            </div>
            <Badge variant="amber">{assignments.length}</Badge>
          </div>
          {assignments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No assignments for this course.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{a.title}</p>
                    <StatusBadge status={a.my_submission ? a.my_submission.status : 'pending'} />
                  </div>
                  <p className="text-xs text-slate-500">
                    Due: {formatDate(a.due_date)} • Max: {a.max_marks} Marks
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button
                      size="sm"
                      variant={a.my_submission ? 'outline' : 'primary'}
                      onClick={() => navigate(`/student/assignments/${a.id}/submit`)}
                    >
                      {a.my_submission ? 'Update Submission' : 'Submit Assignment'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Quizzes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Online Quizzes</h3>
            </div>
            <Badge variant="green">{quizzes.length}</Badge>
          </div>
          {quizzes.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No quizzes for this course.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900">{q.title}</p>
                    <Badge variant="indigo">{q.duration_minutes}m</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Total: {q.total_marks} Marks • Pass: {q.passing_marks} Marks • Attempts:{' '}
                    {q.my_attempts_count ?? 0}/{q.max_attempts}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/student/quiz/${q.id}`)}
                    >
                      Start Examination
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      <Modal
        isOpen={!!activeLecture}
        onClose={() => setActiveLecture(null)}
        title={activeLecture?.title || 'Video Lecture'}
        subtitle={`${course.title} • ${activeLecture?.duration_minutes || 0} Minutes`}
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
                      Open External Video Stream
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-600">{activeLecture.description}</p>
              <Button
                variant={activeLecture.is_completed ? 'success' : 'primary'}
                icon={CheckCircle2}
                onClick={async () => {
                  await handleToggleLectureComplete(activeLecture);
                  setActiveLecture((prev) =>
                    prev ? { ...prev, is_completed: !prev.is_completed } : null
                  );
                }}
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
