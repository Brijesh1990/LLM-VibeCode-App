import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Inbox,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { formatDateTime, resolveFileUrl } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export default function StudentSubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.listSubmissions();
      setSubmissions(res.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load submission history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      return (
        !search ||
        s.assignment_title?.toLowerCase().includes(search.toLowerCase()) ||
        s.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        s.feedback_text?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [submissions, search]);

  const columns = [
    {
      header: 'Assignment & Course',
      accessor: 'assignment_title',
      render: (s) => (
        <div>
          <p className="font-bold text-slate-900">{s.assignment_title}</p>
          <p className="text-xs text-slate-500">{s.course_title}</p>
        </div>
      ),
    },
    {
      header: 'Submitted At',
      accessor: 'submitted_at',
      render: (s) => (
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-700">{formatDateTime(s.submitted_at)}</p>
          <Badge variant={s.is_late ? 'amber' : 'green'}>
            {s.is_late ? 'Late Submission' : 'On Time'}
          </Badge>
        </div>
      ),
    },
    {
      header: 'Deliverable File',
      render: (s) =>
        s.file_name ? (
          <a
            href={resolveFileUrl(s.file_path)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
          >
            <FileText className="w-3.5 h-3.5" /> {s.file_name}
          </a>
        ) : (
          <span className="text-xs text-slate-500">Written Text Response</span>
        ),
    },
    {
      header: 'Awarded Marks',
      accessor: 'marks_obtained',
      render: (s) =>
        s.marks_obtained != null ? (
          <div>
            <span className="text-sm font-extrabold text-emerald-700">
              {s.marks_obtained} / {s.max_marks}
            </span>
            <p className="text-[11px] text-slate-400">
              {Math.round((s.marks_obtained / (s.max_marks || 100)) * 100)}% Score
            </p>
          </div>
        ) : (
          <span className="text-xs font-medium text-amber-600">Awaiting Evaluation</span>
        ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Actions',
      render: (s) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={MessageSquare}
            onClick={() => setSelectedSub(s)}
          >
            Feedback & Rubric
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Upload}
            onClick={() => navigate(`/student/assignments/${s.assignment_id}/submit`)}
          >
            Update
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading your submission history and instructor evaluations..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assignment Submissions & Evaluations"
        subtitle="Track your submitted deliverables, awarded marks, late flags, and detailed instructor rubric feedback."
        badge={<Badge variant="indigo">{submissions.length} Submissions</Badge>}
      />

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search submissions by assignment, course, or feedback..."
          className="w-full sm:w-96"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredSubmissions}
        emptyTitle="No assignment submissions yet"
        emptyDescription="Submit an assignment from the My Assignments page to view evaluation results here."
      />

      {/* Detailed Instructor Feedback & Rubric Notes Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title={selectedSub?.assignment_title || 'Submission Details'}
        subtitle={`${selectedSub?.course_title || ''} • Submitted ${formatDateTime(selectedSub?.submitted_at)}`}
        size="lg"
      >
        {selectedSub && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <StatusBadge status={selectedSub.status} />
                <Badge variant={selectedSub.is_late ? 'amber' : 'green'}>
                  {selectedSub.is_late ? 'Late Submission' : 'Submitted On Time'}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Evaluation Score</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {selectedSub.marks_obtained != null
                    ? `${selectedSub.marks_obtained} / ${selectedSub.max_marks} Marks`
                    : 'Pending Review'}
                </p>
              </div>
            </div>

            {/* Student Written Response */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Your Submitted Response
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line">
                {selectedSub.submission_text || 'No written notes included.'}
              </div>
              {selectedSub.file_name && (
                <div className="mt-2">
                  <a
                    href={resolveFileUrl(selectedSub.file_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Download Attached File ({selectedSub.file_name})
                  </a>
                </div>
              )}
            </div>

            {/* Instructor Feedback & Rubric Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Instructor Evaluation & Rubric Notes
              </h4>

              {selectedSub.status === 'evaluated' || selectedSub.feedback_text ? (
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Evaluated by:{' '}
                      <strong className="text-slate-800">
                        {selectedSub.evaluator_name || 'Course Instructor'}
                      </strong>
                    </span>
                    <span>{formatDateTime(selectedSub.evaluated_at)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Instructor Feedback:</p>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                      {selectedSub.feedback_text || 'Good work!'}
                    </p>
                  </div>
                  {selectedSub.rubric_notes && (
                    <div className="p-3 rounded-xl bg-white border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-900">Detailed Rubric Breakdown:</p>
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                        {selectedSub.rubric_notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Your submission is currently queued for instructor grading. You will receive an
                    instant notification once evaluated.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedSub(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
