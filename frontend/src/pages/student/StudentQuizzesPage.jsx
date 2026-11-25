import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BrainCircuit,
  Clock,
  Award,
  Play,
  Trophy,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

export default function StudentQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const [qzRes, enrRes] = await Promise.all([
        quizService.listQuizzes(),
        batchService.listEnrollments(),
      ]);
      setQuizzes(qzRes.items || []);
      setEnrollments(enrRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load available quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchCourse = !courseFilter || String(q.course_id) === String(courseFilter);
      const matchSearch =
        !search ||
        q.title?.toLowerCase().includes(search.toLowerCase()) ||
        q.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        q.description?.toLowerCase().includes(search.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [quizzes, courseFilter, search]);

  if (loading) {
    return <Loader text="Loading available quizzes and examination rooms..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Quizzes & Online Examinations"
        subtitle="Take timed MCQ and True/False assessments with instant server-side grading and detailed explanations."
        badge={<Badge variant="indigo">{quizzes.length} Quizzes</Badge>}
        actions={
          <Button
            variant="outline"
            icon={Trophy}
            onClick={() => navigate('/student/results')}
          >
            View My Quiz Results
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search quizzes by title or course..."
          className="w-full sm:w-96"
        />
        <div className="w-full sm:w-72">
          <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Enrolled Courses</option>
            {enrollments.map((e) => (
              <option key={e.course_id} value={e.course_id}>
                {e.course_title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <EmptyState
          icon={BrainCircuit}
          title="No quizzes available"
          description="No published quizzes match your current course filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQuizzes.map((q) => {
            const myAttempts = q.my_attempts_count ?? 0;
            const maxAttempts = q.max_attempts ?? 1;
            const latest = q.latest_attempt;
            const attemptsExhausted =
              myAttempts >= maxAttempts || (myAttempts >= 1 && !q.allow_retake);

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="indigo">{q.course_title}</Badge>
                    <Badge variant="cyan">{q.questions_count || 0} Questions</Badge>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{q.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {q.description || 'Timed online assessment covering core course concepts.'}
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Duration</p>
                      <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-[#4F46E5]" /> {q.duration_minutes} Minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total / Passing Marks</p>
                      <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> {q.total_marks} /{' '}
                        {q.passing_marks} Marks
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">My Attempts</p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {myAttempts} of {maxAttempts} used
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Retake Policy</p>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {q.allow_retake ? 'Retakes Allowed' : 'Single Attempt'}
                      </p>
                    </div>
                  </div>

                  {latest && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Latest Score: {latest.obtained_marks}/{latest.total_marks} ({latest.percentage}%)
                      </span>
                      <Badge variant={latest.is_passed ? 'green' : 'red'}>
                        {latest.is_passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {attemptsExhausted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={CheckCircle2}
                      className="w-full"
                      onClick={() => navigate('/student/results')}
                    >
                      Attempts Completed • View Results
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={myAttempts > 0 ? RotateCcw : Play}
                      className="w-full"
                      onClick={() => navigate(`/student/quiz/${q.id}`)}
                    >
                      {myAttempts > 0 ? 'Retake Examination' : 'Start Examination'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
