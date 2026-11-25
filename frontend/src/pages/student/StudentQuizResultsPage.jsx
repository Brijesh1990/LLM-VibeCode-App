import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Eye,
  BrainCircuit,
  Download,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { formatDateTime, exportTableToPDF } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export default function StudentQuizResultsPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      const res = await quizService.listAttempts();
      setAttempts(res.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      return (
        !search ||
        a.quiz_title?.toLowerCase().includes(search.toLowerCase()) ||
        a.course_title?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [attempts, search]);

  const handleExportPDF = () => {
    const cols = ['Quiz Title', 'Course', 'Attempt #', 'Score', 'Percentage', 'Result', 'Date'];
    const rows = filteredAttempts.map((a) => [
      a.quiz_title,
      a.course_title,
      `#${a.attempt_number}`,
      `${a.obtained_marks} / ${a.total_marks}`,
      `${a.percentage}%`,
      a.is_passed ? 'PASSED' : 'FAILED',
      formatDateTime(a.submitted_at || a.started_at),
    ]);
    exportTableToPDF('Student Quiz & Examination Transcript', cols, rows, 'my_quiz_results.pdf');
    toast.success('Quiz transcript exported to PDF');
  };

  const columns = [
    {
      header: 'Quiz & Course',
      accessor: 'quiz_title',
      render: (a) => (
        <div>
          <p className="font-bold text-slate-900">{a.quiz_title}</p>
          <p className="text-xs text-slate-500">{a.course_title}</p>
        </div>
      ),
    },
    {
      header: 'Attempt #',
      accessor: 'attempt_number',
      render: (a) => <Badge variant="violet">Attempt #{a.attempt_number}</Badge>,
    },
    {
      header: 'Score Awarded',
      accessor: 'obtained_marks',
      render: (a) => (
        <span className="font-extrabold text-slate-900">
          {a.obtained_marks} / {a.total_marks}
        </span>
      ),
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (a) => (
        <span
          className={`font-bold ${
            a.is_passed ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {a.percentage}%
        </span>
      ),
    },
    {
      header: 'Outcome',
      accessor: 'is_passed',
      render: (a) => (
        <Badge variant={a.is_passed ? 'green' : 'red'}>
          {a.is_passed ? 'PASSED' : 'FAILED'}
        </Badge>
      ),
    },
    {
      header: 'Submitted At',
      accessor: 'submitted_at',
      render: (a) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(a.submitted_at || a.started_at)}
        </span>
      ),
    },
    {
      header: 'Breakdown',
      render: (a) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => setSelectedAttempt(a)}
        >
          Answer Breakdown
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading your quiz attempt history and transcripts..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Quiz Results & Examination Transcript"
        subtitle="Review all past quiz attempts, server-calculated scores, pass/fail standing, and question-level answer breakdowns."
        badge={<Badge variant="indigo">{attempts.length} Attempts</Badge>}
        actions={
          <>
            {attempts.length > 0 && (
              <Button variant="outline" icon={Download} onClick={handleExportPDF}>
                Export Transcript PDF
              </Button>
            )}
            <Button
              variant="primary"
              icon={BrainCircuit}
              onClick={() => navigate('/student/quizzes')}
            >
              Available Quizzes
            </Button>
          </>
        }
      />

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search results by quiz title or course..."
          className="w-full sm:w-96"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredAttempts}
        emptyTitle="No quiz results found"
        emptyDescription="You have not completed any online quizzes yet. Visit Available Quizzes to start an examination."
      />

      {/* Answer Breakdown Modal */}
      <Modal
        isOpen={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        title={`Answer Breakdown: ${selectedAttempt?.quiz_title || ''}`}
        subtitle={`${selectedAttempt?.course_title || ''} • Attempt #${selectedAttempt?.attempt_number || 1} • Score: ${selectedAttempt?.obtained_marks}/${selectedAttempt?.total_marks} (${selectedAttempt?.percentage}%)`}
        size="xl"
      >
        {selectedAttempt && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAttempt.status} />
                <Badge variant={selectedAttempt.is_passed ? 'green' : 'red'}>
                  {selectedAttempt.is_passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
              <div className="text-xs text-slate-600">
                Submitted: <strong>{formatDateTime(selectedAttempt.submitted_at)}</strong>
              </div>
            </div>

            {(selectedAttempt.answers || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No individual question answers recorded for this attempt.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedAttempt.answers.map((ans, idx) => (
                  <div
                    key={ans.id || idx}
                    className={`p-4 rounded-xl border ${
                      ans.is_correct
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        {ans.is_correct ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Q{idx + 1}. {ans.question_text}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            Selected Option:{' '}
                            <strong className="text-slate-900">{ans.selected_option_text}</strong>
                          </p>
                        </div>
                      </div>
                      <Badge variant={ans.is_correct ? 'green' : 'red'}>
                        {ans.is_correct ? `+${ans.marks_awarded} Marks` : '0 Marks'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedAttempt(null)}>
                Close Breakdown
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
