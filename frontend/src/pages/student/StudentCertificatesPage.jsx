import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL } from '../../constants';
import { formatDate } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingCourseId, setGeneratingCourseId] = useState(null);

  const loadCertificatesData = async () => {
    try {
      setLoading(true);
      const [certRes, progRes] = await Promise.all([
        paymentService.listCertificates(),
        studentService.getProgress(),
      ]);
      setCertificates(certRes.items || []);
      setProgressItems(progRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificatesData();
  }, []);

  const handleGenerateCertificate = async (courseId, courseTitle) => {
    try {
      setGeneratingCourseId(courseId);
      await paymentService.generateCertificate({
        student_id: user?.id,
        course_id: courseId,
        force_issue: false,
      });
      toast.success(`Official certificate issued for ${courseTitle}!`);
      await loadCertificatesData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not generate certificate.');
    } finally {
      setGeneratingCourseId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading your issued credentials and eligible courses..." />;
  }

  const issuedCourseIds = new Set(certificates.map((c) => c.course_id));
  const unclaimedEligibleCourses = progressItems.filter(
    (p) => p.is_eligible_for_certificate && !issuedCourseIds.has(p.course_id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Course Certificates & Credentials"
        subtitle="Download verifiable ReportLab PDF certificates with unique QR/verification codes and public verification links."
        badge={<Badge variant="indigo">{certificates.length} Issued</Badge>}
      />

      {/* Eligible Courses Ready to Claim Banner */}
      {unclaimedEligibleCourses.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-md space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-extrabold">
              Congratulations! You have {unclaimedEligibleCourses.length} course(s) eligible for instant certification
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unclaimedEligibleCourses.map((c) => (
              <div
                key={c.course_id}
                className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-white">{c.course_title}</p>
                  <p className="text-xs text-indigo-100">
                    Completion: {c.completion_percentage}% • Attendance: {c.attendance_percentage}%
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Award}
                  loading={generatingCourseId === c.course_id}
                  onClick={() => handleGenerateCertificate(c.course_id, c.course_title)}
                >
                  Generate Certificate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issued Certificates Grid */}
      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates issued yet"
          description="Complete at least 75% of your enrolled course lectures, assignments, and quizzes to unlock your official certificate."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="bg-gradient-to-r from-[#4F46E5] via-indigo-600 to-[#8B5CF6] px-6 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      NexusLMS Official Credential
                    </span>
                  </div>
                  <Badge variant={c.is_revoked ? 'red' : 'green'}>
                    {c.is_revoked ? 'Revoked' : 'Verified Credential'}
                  </Badge>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase">
                      Awarded To {c.student_name}
                    </p>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      {c.course_title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Course Code: {c.course_code} • Batch: {c.batch_name || 'Direct Cohort'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div>
                      <p className="text-slate-400">Grade Awarded</p>
                      <p className="text-sm font-extrabold text-[#4F46E5] mt-0.5">{c.grade}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Final Score</p>
                      <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {c.final_percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Issue Date</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {formatDate(c.issue_date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      Certificate ID:{' '}
                      <code className="font-mono font-bold text-slate-800">
                        {c.certificate_number}
                      </code>
                    </p>
                    <p>
                      Verification Code:{' '}
                      <code className="font-mono font-bold text-indigo-700">
                        {c.verification_code}
                      </code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to={`/verify-certificate/${c.certificate_number}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
                >
                  <ShieldCheck className="w-4 h-4" /> Public Verification Link
                </Link>

                <a
                  href={`${API_BASE_URL}/certificates/${c.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toast.success(`Downloading ${c.certificate_number}.pdf...`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF Certificate
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
