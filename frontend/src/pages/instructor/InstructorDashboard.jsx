import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CalendarRange,
  GraduationCap,
  Video,
  CheckCircle2,
  BrainCircuit,
  CalendarCheck,
  FileCheck2,
  TrendingUp,
  Clock,
  ArrowRight,
  Award,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import AttendanceChart from '../../components/charts/AttendanceChart';
import PerformanceChart from '../../components/charts/PerformanceChart';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Evaluate Submission Modal State
  const [evalSub, setEvalSub] = useState(null);
  const [marks, setMarks] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rubricNotes, setRubricNotes] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardKPIs();
      setData(res);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load instructor dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const openQuickEvaluate = (sub) => {
    setEvalSub(sub);
    setMarks(sub.marks_obtained != null ? String(sub.marks_obtained) : '');
    setFeedbackText(sub.feedback_text || 'Well-structured solution meeting assignment criteria.');
    setRubricNotes(sub.rubric_notes || 'Code quality, architecture, and documentation verified.');
  };

  const handleQuickEvaluate = async (e) => {
    e.preventDefault();
    if (!evalSub) return;
    try {
      setEvaluating(true);
      await assignmentService.evaluateSubmission(evalSub.id, {
        marks_obtained: Number(marks),
        feedback_text: feedbackText,
        rubric_notes: rubricNotes,
      });
      toast.success(`Evaluated ${evalSub.student_name}'s submission!`);
      setEvalSub(null);
      await loadDashboard();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not evaluate submission');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading instructor command center and cohort analytics..." />;
  }

  const kpis = data?.kpis || {};
  const upcomingLectures = data?.upcoming_lectures || [];
  const recentSubmissions = data?.recent_submissions || [];
  const attendanceChartData = (data?.attendance_overview || []).map((b) => ({
    ...b,
    name: b.name || b.batch_name || `Batch #${b.batch_id}`,
    attendance_pct: b.attendance_pct ?? b.attendance_percentage ?? 100,
  }));
  const performanceChartData = data?.student_performance || [];

  const submissionColumns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (s) => (
        <div>
          <p className="font-bold text-slate-900">{s.student_name}</p>
          <p className="text-xs text-slate-500">{s.student_email}</p>
        </div>
      ),
    },
    {
      header: 'Assignment & Course',
      accessor: 'assignment_title',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800">{s.assignment_title}</p>
          <p className="text-xs text-slate-500">{s.course_title}</p>
        </div>
      ),
    },
    {
      header: 'Submitted',
      accessor: 'submitted_at',
      render: (s) => (
        <div className="space-y-1">
          <p className="text-xs text-slate-600">{formatDateTime(s.submitted_at)}</p>
          {s.is_late && <Badge variant="amber">Late</Badge>}
        </div>
      ),
    },
    {
      header: 'Score',
      accessor: 'marks_obtained',
      render: (s) =>
        s.marks_obtained != null ? (
          <span className="font-extrabold text-emerald-700">
            {s.marks_obtained} / {s.max_marks}
          </span>
        ) : (
          <span className="text-xs font-medium text-amber-600">Needs Grading</span>
        ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Action',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={s.status === 'evaluated' ? 'outline' : 'primary'}
            icon={CheckCircle2}
            onClick={() => openQuickEvaluate(s)}
          >
            {s.status === 'evaluated' ? 'Update Grade' : 'Quick Evaluate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Instructor Workspace — ${user?.full_name || 'Faculty'}`}
        subtitle={`${user?.designation || 'Senior Faculty'} • ${user?.department || 'Academic Department'} • Manage cohorts, lectures, attendance, and evaluations.`}
        badge={<Badge variant="indigo">Faculty Portal</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              icon={CalendarCheck}
              onClick={() => navigate('/instructor/attendance')}
            >
              Mark Attendance
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => navigate('/instructor/evaluations')}
            >
              Evaluate Submissions ({kpis.pending_evaluations ?? 0})
            </Button>
          </>
        }
      />

      {/* 6 KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Assigned Courses"
          value={kpis.assigned_courses ?? 0}
          subtitle="Active Curricula"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Assigned Batches"
          value={kpis.assigned_batches ?? 0}
          subtitle="Active Cohorts"
          icon={CalendarRange}
          color="cyan"
          delay={40}
        />
        <StatCard
          title="Total Students"
          value={kpis.total_students ?? 0}
          subtitle="Enrolled Learners"
          icon={GraduationCap}
          color="violet"
          delay={80}
        />
        <StatCard
          title="Published Lectures"
          value={kpis.upcoming_lectures ?? 0}
          subtitle="Syllabus Sessions"
          icon={Video}
          color="emerald"
          delay={120}
        />
        <StatCard
          title="Pending Evaluations"
          value={kpis.pending_evaluations ?? 0}
          subtitle="Awaiting Grading"
          icon={FileCheck2}
          color="amber"
          delay={160}
        />
        <StatCard
          title="Avg Quiz Score"
          value={`${kpis.avg_quiz_score ?? 0}%`}
          subtitle="Cohort Exam Mean"
          icon={BrainCircuit}
          color="rose"
          delay={200}
        />
      </div>

      {/* Charts Row: AttendanceChart & PerformanceChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart data={attendanceChartData} />
        <PerformanceChart data={performanceChartData} />
      </div>

      {/* Recent Submissions Table & Upcoming Lectures List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Student Assignment Submissions
              </h3>
              <p className="text-xs text-slate-500">
                Grade student work directly or navigate to the full evaluation workbench
              </p>
            </div>
            <Link
              to="/instructor/submissions"
              className="text-xs font-semibold text-[#4F46E5] hover:underline inline-flex items-center gap-1"
            >
              All Submissions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <DataTable
            columns={submissionColumns}
            data={recentSubmissions}
            pageSize={5}
            emptyTitle="No student submissions yet"
            emptyDescription="Submissions from your assigned courses will appear here."
          />
        </div>

        {/* Upcoming / Syllabus Lectures List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Course Lectures</h3>
                <p className="text-xs text-slate-500">Scheduled & published syllabus sessions</p>
              </div>
              <Link
                to="/instructor/lectures"
                className="text-xs font-semibold text-[#4F46E5] hover:underline"
              >
                Manage All
              </Link>
            </div>

            {upcomingLectures.length === 0 ? (
              <EmptyState
                icon={Video}
                title="No lectures scheduled"
                description="Publish a new video lecture for your assigned courses."
                action={
                  <Button
                    size="sm"
                    onClick={() => navigate('/instructor/lectures')}
                  >
                    Create Lecture
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {upcomingLectures.map((lec) => (
                  <div
                    key={lec.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="indigo">{lec.course_title}</Badge>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lec.duration_minutes}m
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-1.5">{lec.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{lec.module_title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              icon={TrendingUp}
              onClick={() => navigate('/instructor/progress')}
            >
              Student Progress
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Video}
              onClick={() => navigate('/instructor/lectures')}
            >
              Manage Lectures
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Evaluate Modal */}
      <Modal
        isOpen={!!evalSub}
        onClose={() => setEvalSub(null)}
        title={`Evaluate Submission: ${evalSub?.assignment_title || ''}`}
        subtitle={`Student: ${evalSub?.student_name || ''} • Max Marks: ${evalSub?.max_marks || 100}`}
        size="md"
      >
        {evalSub && (
          <form onSubmit={handleQuickEvaluate} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 mb-1">Student Written Response:</p>
              <p className="whitespace-pre-line">
                {evalSub.submission_text || 'File submission attached.'}
              </p>
            </div>

            <Input
              label={`Marks Obtained (Out of ${evalSub.max_marks})`}
              type="number"
              step="0.5"
              min="0"
              max={evalSub.max_marks}
              required
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
            />

            <Textarea
              label="Instructor Feedback"
              rows={3}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />

            <Textarea
              label="Rubric Evaluation Notes"
              rows={2}
              value={rubricNotes}
              onChange={(e) => setRubricNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setEvalSub(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={evaluating} icon={CheckCircle2}>
                Save Evaluation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
