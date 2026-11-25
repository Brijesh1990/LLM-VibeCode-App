import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BookOpen,
  CalendarRange,
  Video,
  FileCheck2,
  BrainCircuit,
  CalendarCheck,
  TrendingUp,
  Bell,
  Trophy,
  Award,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboardKPIs();
      setData(res);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkNotifRead = async (id) => {
    try {
      await reportService.markNotificationRead(id);
      setData((prev) => ({
        ...prev,
        recent_notifications: (prev?.recent_notifications || []).map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
      }));
      toast.success('Notification marked as read');
    } catch {
      toast.error('Could not mark notification as read');
    }
  };

  if (loading) {
    return <Loader text="Loading your personalized learning dashboard..." />;
  }

  const kpis = data?.kpis || {};
  const enrollments = data?.enrollments || [];
  const recentResults = data?.recent_results || [];
  const recentNotifications = data?.recent_notifications || [];
  const attendanceSummary = data?.attendance_summary || {};

  const quickLinks = [
    { label: 'My Courses', path: '/student/courses', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Video Lectures', path: '/student/lectures', icon: Video, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Study Materials', path: '/student/materials', icon: FileText, color: 'text-violet-600 bg-violet-50' },
    { label: 'Assignments', path: '/student/assignments', icon: FileCheck2, color: 'text-amber-600 bg-amber-50' },
    { label: 'Online Quizzes', path: '/student/quizzes', icon: BrainCircuit, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Progress Report', path: '/student/progress', icon: TrendingUp, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Certificates', path: '/student/certificates', icon: Award, color: 'text-amber-600 bg-amber-50' },
    { label: 'Fee & Receipts', path: '/student/payments', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.full_name || 'Student'}!`}
        subtitle={`Student ID: ${user?.student_code || 'STU-0001'} • Track your enrolled courses, upcoming assessments, and live learning progress.`}
        badge={<Badge variant="indigo">Student Portal</Badge>}
        actions={
          <>
            <Button variant="outline" icon={TrendingUp} onClick={() => navigate('/student/progress')}>
              My Progress
            </Button>
            <Button variant="primary" icon={BookOpen} onClick={() => navigate('/student/courses')}>
              Explore Courses
            </Button>
          </>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={kpis.enrolled_courses ?? 0}
          subtitle={`${kpis.active_batches ?? 0} Active Cohort Batch(es)`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Completed Lectures"
          value={kpis.completed_lectures ?? 0}
          subtitle={`Overall Completion: ${kpis.completion_percentage ?? 0}%`}
          icon={Video}
          color="cyan"
          delay={50}
        />
        <StatCard
          title="Pending Assessments"
          value={(kpis.pending_assignments ?? 0) + (kpis.upcoming_quizzes ?? 0)}
          subtitle={`${kpis.pending_assignments ?? 0} Assignments • ${kpis.upcoming_quizzes ?? 0} Quizzes`}
          icon={FileCheck2}
          color="amber"
          delay={100}
        />
        <StatCard
          title="Attendance Rate"
          value={`${kpis.attendance_percentage ?? 100}%`}
          subtitle={`${attendanceSummary.present_classes ?? 0} / ${attendanceSummary.eligible_classes ?? 0} Eligible Sessions`}
          icon={CalendarCheck}
          color="emerald"
          delay={150}
        />
      </div>

      {/* Quick Access Modules Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs" data-aos="fade-up">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Quick Module Navigation
          </h2>
          <span className="text-xs text-slate-400">One-click access to all student tools</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group text-center"
              >
                <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-[#4F46E5]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Enrolled Courses & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Course Enrollments</h3>
              <p className="text-xs text-slate-500">Continue where you left off and complete modules</p>
            </div>
            <Link
              to="/student/courses"
              className="text-xs font-semibold text-[#4F46E5] hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No active course enrollments"
              description="Enroll in a course from the catalog to begin watching lectures and submitting assignments."
              action={
                <Button size="sm" onClick={() => navigate('/student/courses')}>
                  Browse Course Catalog
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 bg-slate-50/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{enr.course_code || `CRS-${enr.course_id}`}</Badge>
                        <StatusBadge status={enr.status} />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1.5">{enr.course_title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Instructor: <span className="font-medium text-slate-700">{enr.instructor_name}</span> • Batch:{' '}
                        <span className="font-medium text-slate-700">{enr.batch_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Video}
                        onClick={() => navigate(`/student/course/${enr.course_id}`)}
                      >
                        Open Syllabus
                      </Button>
                    </div>
                  </div>
                  <ProgressBar
                    value={enr.completion_percentage || 0}
                    label="Course Completion Progress"
                    color={enr.completion_percentage >= 75 ? 'emerald' : 'indigo'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Academic Standing Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Academic Standing & Eligibility</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live metrics calculated from lectures, assignments, quizzes & attendance
            </p>

            <div className="mt-6 space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <ProgressBar
                  value={kpis.completion_percentage ?? 0}
                  label="Overall Course Completion"
                  color="indigo"
                  size="lg"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Weighted across completed video lectures (50%), assignments (30%), and quizzes (20%).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <ProgressBar
                  value={kpis.attendance_percentage ?? 100}
                  label="Verified Session Attendance"
                  color="emerald"
                  size="lg"
                />
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Present</p>
                    <p className="text-sm font-bold text-emerald-700">
                      {attendanceSummary.present_classes ?? 0}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Absent</p>
                    <p className="text-sm font-bold text-red-600">
                      {attendanceSummary.absent_classes ?? 0}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500">Leave/Hol</p>
                    <p className="text-sm font-bold text-cyan-700">
                      {(attendanceSummary.approved_leaves ?? 0) +
                        (attendanceSummary.holidays_or_cancelled ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ready for certification?</span>
            <Button
              size="sm"
              variant="accent"
              icon={Award}
              onClick={() => navigate('/student/certificates')}
            >
              My Certificates
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Quiz Results & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quiz Results */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Recent Quiz Results</h3>
            </div>
            <Link
              to="/student/results"
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              All Results
            </Link>
          </div>

          {recentResults.length === 0 ? (
            <EmptyState
              icon={BrainCircuit}
              title="No quiz attempts yet"
              description="Take an available online examination to see your instant score and breakdown."
              action={
                <Button size="sm" variant="outline" onClick={() => navigate('/student/quizzes')}>
                  Take a Quiz
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentResults.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{att.quiz_title}</p>
                    <p className="text-xs text-slate-500">
                      {att.course_title} • Attempt #{att.attempt_number} •{' '}
                      {formatDate(att.submitted_at || att.started_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">
                        {att.obtained_marks} / {att.total_marks}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">{att.percentage}%</p>
                    </div>
                    <Badge variant={att.is_passed ? 'green' : 'red'}>
                      {att.is_passed ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#4F46E5]" />
              <h3 className="text-base font-bold text-slate-900">Recent Notifications</h3>
            </div>
            <Link
              to="/student/notifications"
              className="text-xs font-semibold text-[#4F46E5] hover:underline"
            >
              View All
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="All caught up!"
              description="You have no recent notifications at this time."
            />
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.is_read
                      ? 'bg-slate-50/60 border-slate-100'
                      : 'bg-indigo-50/40 border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        {!n.is_read && <Badge variant="indigo">New</Badge>}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDateTime(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotifRead(n.id)}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline shrink-0 cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
