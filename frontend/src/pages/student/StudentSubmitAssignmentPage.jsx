import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileCheck2,
  ArrowLeft,
  Send,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { formatDateTime, resolveFileUrl } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentSubmitAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assignmentId = Number(id);

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getAssignment(assignmentId);
      setAssignment(data);
      if (data.my_submission?.submission_text) {
        setSubmissionText(data.my_submission.submission_text);
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !file && !assignment?.my_submission?.file_path) {
      toast.error('Please write your submission response or attach a deliverable file.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('assignment_id', String(assignmentId));
      if (submissionText.trim()) {
        formData.append('submission_text', submissionText.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      await assignmentService.submitAssignment(formData);
      toast.success('Assignment submitted successfully!');
      navigate('/student/submissions');
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading assignment workspace..." />;
  }

  if (!assignment) {
    return (
      <EmptyState
        title="Assignment Not Found"
        description="The requested assignment does not exist or is not accessible."
        action={
          <Button onClick={() => navigate('/student/assignments')}>Back to Assignments</Button>
        }
      />
    );
  }

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const existingSub = assignment.my_submission;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Submit Assignment: ${assignment.title}`}
        subtitle={`${assignment.course_title} • Due: ${formatDateTime(assignment.due_date)}`}
        badge={<StatusBadge status={existingSub ? existingSub.status : 'pending'} />}
        actions={
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/student/assignments')}
          >
            Back to Assignments
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignment Brief & Instructions */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="indigo">{assignment.course_title}</Badge>
              <Badge variant="amber">Max: {assignment.max_marks} Marks</Badge>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{assignment.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {assignment.description}
              </p>
            </div>

            {assignment.instructions && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Deliverable Instructions & Rubric
                </p>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {assignment.instructions}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Due Date:
                </span>
                <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                  {formatDateTime(assignment.due_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" /> Passing Score:
                </span>
                <span className="font-bold text-slate-900">
                  {assignment.passing_marks} / {assignment.max_marks} Marks
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Late Policy:</span>
                <Badge variant={assignment.allow_late_submission ? 'cyan' : 'red'}>
                  {assignment.allow_late_submission ? 'Late Permitted' : 'Strict Cutoff'}
                </Badge>
              </div>
            </div>

            {isOverdue && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Deadline Passed</p>
                  <p className="mt-0.5">
                    {assignment.allow_late_submission
                      ? 'Your submission will be flagged as a Late Submission.'
                      : 'Late submissions are disabled for this assignment.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {existingSub && (
            <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">Previous Submission Record</h4>
                <StatusBadge status={existingSub.status} />
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {formatDateTime(existingSub.submitted_at)}
              </p>
              {existingSub.file_name && (
                <a
                  href={resolveFileUrl(existingSub.file_path)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" /> {existingSub.file_name}
                </a>
              )}
              {existingSub.marks_obtained != null && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900">
                    Awarded Marks: {existingSub.marks_obtained} / {assignment.max_marks}
                  </p>
                  {existingSub.feedback_text && (
                    <p className="text-xs text-emerald-800 mt-1">
                      Feedback: {existingSub.feedback_text}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {existingSub ? 'Update Your Assignment Submission' : 'New Assignment Submission'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Provide your written analysis, repository links, or code notes below and attach your deliverable archive or PDF.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Textarea
              label="Written Submission / Project Summary / GitHub Link"
              rows={8}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Write your detailed solution, methodology, architecture notes, or repository links here..."
            />

            <FileUpload
              label="Upload Deliverable File (PDF, ZIP, DOCX, PPTX, PNG, JPG)"
              file={file}
              onFileSelect={setFile}
              hint="Attach your project archive (.zip), report (.pdf/.docx), or presentation (.pptx) up to 50MB"
            />

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/student/assignments')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Send}
                loading={submitting}
                disabled={isOverdue && !assignment.allow_late_submission}
              >
                {existingSub ? 'Resubmit Assignment' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
