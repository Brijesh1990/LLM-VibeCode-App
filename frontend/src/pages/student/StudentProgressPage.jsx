import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  Video,
  FileCheck2,
  BrainCircuit,
  CalendarCheck,
  Award,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressItems, setProgressItems] = useState([]);
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [overallAttendance, setOverallAttendance] = useState(100);
  const [loading, setLoading] = useState(true);
  const [claimingCourseId, setClaimingCourseId] = useState(null);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await studentService.getProgress();
      setProgressItems(res.items || []);
      setOverallCompletion(res.overall_completion_percentage ?? 0);
      setOverallAttendance(res.overall_attendance_percentage ?? 100);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load academic progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleClaimCertificate = async (courseId, courseTitle) => {
    try {
      setClaimingCourseId(courseId);
      await paymentService.generateCertificate({
        student_id: user?.id,
        course_id: courseId,
        force_issue: false,
      });
      toast.success(`Certificate generated for ${courseTitle}!`);
      navigate('/student/certificates');
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          'Could not generate certificate. Ensure course completion meets threshold.'
      );
    } finally {
      setClaimingCourseId(null);
    }
  };

  if (loading) {
    return <Loader text="Analyzing your course-by-course academic performance..." />;
  }

  const eligibleCoursesCount = progressItems.filter((p) => p.is_eligible_for_certificate).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Academic Progress & Competency Breakdown"
        subtitle="Real-time course completion calculated across video lectures (50%), assignments (30%), and quizzes (20%)."
        badge={<Badge variant="indigo">{overallCompletion}% Overall Progress</Badge>}
        actions={
          <Button
            variant="accent"
            icon={Award}
            onClick={() => navigate('/student/certificates')}
          >
            My Certificates ({eligibleCoursesCount} Eligible)
          </Button>
        }
      />

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Overall Course Completion"
          value={`${overallCompletion}%`}
          subtitle={`Across ${progressItems.length} Enrolled Course(s)`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Overall Attendance Rate"
          value={`${overallAttendance}%`}
          subtitle="Verified Cohort Attendance"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Certificate Eligibility"
          value={`${eligibleCoursesCount} / ${progressItems.length}`}
          subtitle="Courses Meeting Completion Threshold"
          icon={Award}
          color="violet"
        />
      </div>

      {/* Detailed Course-by-Course Breakdown */}
      {progressItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses to track"
          description="Enroll in a course from the catalog to start tracking your learning progress."
          action={
            <Button onClick={() => navigate('/student/courses')}>Explore Courses</Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {progressItems.map((item) => (
            <div
              key={item.course_id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo">{item.batch_name || 'Direct Cohort'}</Badge>
                    <Badge variant={item.is_eligible_for_certificate ? 'green' : 'amber'}>
                      {item.is_eligible_for_certificate
                        ? 'Eligible for Certificate'
                        : 'In Progress'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">
                    {item.course_title}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/student/course/${item.course_id}`)}
                  >
                    Open Course
                  </Button>
                  {item.is_eligible_for_certificate && (
                    <Button
                      size="sm"
                      variant="success"
                      icon={Award}
                      loading={claimingCourseId === item.course_id}
                      onClick={() =>
                        handleClaimCertificate(item.course_id, item.course_title)
                      }
                    >
                      Claim Certificate
                    </Button>
                  )}
                </div>
              </div>

              <ProgressBar
                value={item.completion_percentage || 0}
                label="Weighted Course Completion Percentage"
                color={item.is_eligible_for_certificate ? 'emerald' : 'indigo'}
                size="lg"
              />

              {/* 4-Pillar Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Video Lectures (50% Weight)</span>
                    <Video className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {item.completed_lectures} / {item.total_lectures}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.pending_lectures} Lecture(s) Remaining
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Assignments (30% Weight)</span>
                    <FileCheck2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {item.submitted_assignments} / {item.total_assignments}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avg Score: <strong>{item.avg_assignment_score}%</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Online Quizzes (20% Weight)</span>
                    <BrainCircuit className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {item.completed_quizzes} / {item.total_quizzes}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Avg Quiz Score: <strong>{item.avg_quiz_score}%</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Session Attendance</span>
                    <CalendarCheck className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-lg font-extrabold text-slate-900">
                    {item.attendance_percentage}%
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified Batch Attendance
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
