import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Trophy,
  XCircle,
  BrainCircuit,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentQuizExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quizId = Number(id);

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: option_id }
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    const initExam = async () => {
      try {
        setLoading(true);
        const data = await quizService.startQuiz(quizId);
        setAttempt(data.attempt);
        setQuiz(data.quiz);

        if (data.attempt?.expires_at) {
          const expMs = new Date(data.attempt.expires_at).getTime();
          const nowMs = Date.now();
          const diffSec = Math.max(0, Math.floor((expMs - nowMs) / 1000));
          setSecondsLeft(diffSec);
        } else {
          setSecondsLeft((data.quiz?.duration_minutes || 20) * 60);
        }
      } catch (err) {
        const msg = err?.response?.data?.detail || 'Could not start quiz examination.';
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [quizId]);

  const handleSubmitExam = useCallback(
    async (isAutoTimeout = false) => {
      if (!attempt || submitting || result) return;
      try {
        setSubmitting(true);
        const questions = quiz?.questions || [];
        const formattedAnswers = questions.map((q) => ({
          question_id: q.id,
          selected_option_id: selectedAnswers[q.id] ?? null,
        }));

        const gradedAttempt = await quizService.submitQuizAttempt(attempt.id, formattedAnswers);
        setResult(gradedAttempt);
        if (isAutoTimeout) {
          toast('Time expired! Your examination was automatically submitted and graded.', {
            icon: '⏱️',
          });
        } else {
          toast.success(
            `Examination submitted! You scored ${gradedAttempt.obtained_marks}/${gradedAttempt.total_marks} (${gradedAttempt.percentage}%)`
          );
        }
      } catch (err) {
        toast.error(err?.response?.data?.detail || 'Failed to submit quiz attempt.');
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, quiz, selectedAnswers, submitting, result]
  );

  // Live countdown timer from server expires_at
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0 && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmitExam(true);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, result, handleSubmitExam]);

  const formatTimer = (sec) => {
    const s = Math.max(0, Number(sec || 0));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  if (loading) {
    return <Loader text="Initializing secure examination room and syncing server timer..." />;
  }

  if (errorMsg || !quiz || !attempt) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Examination Room Unavailable"
          subtitle="Unable to launch this quiz attempt"
          actions={
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/student/quizzes')}>
              Back to Quizzes
            </Button>
          }
        />
        <EmptyState
          icon={AlertTriangle}
          title="Cannot Start Examination"
          description={errorMsg}
          action={
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/student/quizzes')}>
                Available Quizzes
              </Button>
              <Button variant="primary" onClick={() => navigate('/student/results')}>
                View Past Results
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // Immediate Server-Calculated Score & Answer Breakdown Screen
  if (result) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Examination Result: ${quiz.title}`}
          subtitle={`${quiz.course_title} • Attempt #${result.attempt_number}`}
          badge={
            <Badge variant={result.is_passed ? 'green' : 'red'}>
              {result.is_passed ? 'PASSED' : 'FAILED'}
            </Badge>
          }
          actions={
            <>
              <Button variant="outline" onClick={() => navigate('/student/quizzes')}>
                Back to Quizzes
              </Button>
              <Button variant="primary" icon={Trophy} onClick={() => navigate('/student/results')}>
                All Quiz Results
              </Button>
            </>
          }
        />

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <p className="text-xs font-semibold uppercase text-slate-500">Server-Graded Score</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {result.obtained_marks} / {result.total_marks}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100">
              <p className="text-xs font-semibold uppercase text-slate-500">Percentage</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{result.percentage}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100">
              <p className="text-xs font-semibold uppercase text-slate-500">Passing Threshold</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {quiz.passing_marks} Marks
              </p>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                result.is_passed
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-red-50/70 border-red-200'
              }`}
            >
              <p className="text-xs font-semibold uppercase text-slate-500">Final Outcome</p>
              <p
                className={`text-2xl font-extrabold mt-1 ${
                  result.is_passed ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {result.is_passed ? 'PASSED' : 'NEEDS REVIEW'}
              </p>
            </div>
          </div>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Detailed Answer Breakdown & Verification
          </h3>
          <div className="space-y-3">
            {(result.answers || []).map((ans, idx) => (
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
                        Your Answer:{' '}
                        <strong className="text-slate-900">{ans.selected_option_text}</strong>
                      </p>
                    </div>
                  </div>
                  <Badge variant={ans.is_correct ? 'green' : 'red'}>
                    +{ans.marks_awarded ?? 0} Marks
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isLowTime = secondsLeft !== null && secondsLeft < 120;

  return (
    <div className="space-y-6">
      {/* Top Sticky Exam Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="indigo">{quiz.course_title}</Badge>
            <Badge variant="violet">Attempt #{attempt.attempt_number}</Badge>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">{quiz.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-base font-extrabold ${
              isLowTime
                ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                : 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <Button
            variant="success"
            icon={Send}
            loading={submitting}
            onClick={() => handleSubmitExam(false)}
          >
            Submit Exam ({answeredCount}/{questions.length})
          </Button>
        </div>
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No questions in this quiz"
          description="This quiz does not contain any questions yet."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Question Panel */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <Badge variant="amber">{currentQuestion.marks} Marks</Badge>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-5 leading-relaxed">
                {currentQuestion.question_text}
              </h2>

              <div className="mt-6 space-y-3">
                {(currentQuestion.options || []).map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === opt.id;
                  const letter = String.fromCharCode(65 + oIdx);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: opt.id,
                        }))
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#4F46E5] bg-indigo-50/60 text-slate-900 shadow-xs'
                          : 'border-slate-200/80 hover:border-indigo-200 bg-white text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-[#4F46E5] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium">{opt.option_text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Controls */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                icon={ArrowLeft}
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              >
                Previous
              </Button>

              {currentIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  icon={ArrowRight}
                  onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="success"
                  icon={Send}
                  loading={submitting}
                  onClick={() => handleSubmitExam(false)}
                >
                  Finish & Submit Examination
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation Palette */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Question Palette</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jump directly to any question
              </p>
            </div>

            <ProgressBar
              value={(answeredCount / questions.length) * 100}
              label={`Answered ${answeredCount} of ${questions.length}`}
              color="indigo"
            />

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] != null;
                const isCurrent = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                      isCurrent
                        ? ' ring-2 ring-[#4F46E5] border-[#4F46E5] bg-indigo-50 text-[#4F46E5]'
                        : isAnswered
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" /> Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" /> Unanswered ({questions.length - answeredCount})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
