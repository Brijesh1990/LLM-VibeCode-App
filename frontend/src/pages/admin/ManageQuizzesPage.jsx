import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { quizService } from '../../services/quizService';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import QuizForm from '../../components/forms/QuizForm';
import { confirmAction } from '../../components/common/ConfirmDialog';

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [questionQuiz, setQuestionQuiz] = useState(null);
  const [qForm, setQForm] = useState({
    question_text: '',
    marks: 10,
    explanation: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctIndex: 0,
  });

  const loadData = async () => {
    try {
      const [qRes, cRes, bRes] = await Promise.all([
        quizService.listQuizzes(),
        courseService.listCourses(),
        batchService.listBatches(),
      ]);
      setQuizzes(qRes.items || []);
      setCourses(cRes.items || []);
      setBatches(bRes.items || []);
      if (questionQuiz) {
        const refreshed = (qRes.items || []).find((x) => x.id === questionQuiz.id);
        if (refreshed) setQuestionQuiz(refreshed);
      }
    } catch {
      toast.error('Failed to load quizzes.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveQuiz = async (payload) => {
    try {
      if (editing) {
        await quizService.updateQuiz(editing.id, payload);
        toast.success('Quiz updated!');
      } else {
        await quizService.createQuiz(payload);
        toast.success('Quiz created!');
      }
      setModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save quiz.');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionQuiz) return;
    try {
      const opts = [qForm.option1, qForm.option2, qForm.option3, qForm.option4]
        .filter((x) => x.trim())
        .map((text, idx) => ({
          option_text: text,
          is_correct: idx === Number(qForm.correctIndex),
          sort_order: idx + 1,
        }));
      await quizService.addQuestion(questionQuiz.id, {
        question_text: qForm.question_text,
        question_type: 'mcq',
        marks: Number(qForm.marks),
        explanation: qForm.explanation,
        sort_order: (questionQuiz.questions?.length || 0) + 1,
        options: opts,
      });
      toast.success('MCQ question added!');
      setQForm({
        question_text: '',
        marks: 10,
        explanation: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctIndex: 0,
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not add question.');
    }
  };

  const handleDeleteQuestion = async (qid) => {
    try {
      await quizService.deleteQuestion(qid);
      toast.success('Question removed.');
      loadData();
    } catch {
      toast.error('Failed to remove question.');
    }
  };

  const handleDeleteQuiz = async (q) => {
    const ok = await confirmAction({ title: `Delete quiz "${q.title}"?` });
    if (!ok) return;
    try {
      await quizService.deleteQuiz(q.id);
      toast.success('Quiz deleted.');
      loadData();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes & Examination Bank"
        subtitle="Create timed MCQ quizzes, manage question banks, and inspect student attempts"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Create Quiz
          </Button>
        }
      />

      <DataTable
        data={quizzes}
        columns={[
          {
            header: 'Quiz Title',
            accessor: 'title',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.course_title}</p>
              </div>
            ),
          },
          {
            header: 'Questions',
            render: (r) => (
              <span className="font-bold text-[#4F46E5]">{r.questions_count} MCQs</span>
            ),
          },
          {
            header: 'Marks',
            render: (r) => (
              <span>
                Pass {r.passing_marks} / {r.total_marks}
              </span>
            ),
          },
          {
            header: 'Duration',
            render: (r) => <span>{r.duration_minutes} mins</span>,
          },
          {
            header: 'Student Attempts',
            accessor: 'attempts_count',
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={HelpCircle}
                  onClick={() => setQuestionQuiz(r)}
                >
                  Questions ({r.questions_count})
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(r);
                    setModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQuiz(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Quiz' : 'Create Timed Quiz'}
      >
        <QuizForm
          initialData={editing}
          courses={courses}
          batches={batches}
          onSubmit={handleSaveQuiz}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!questionQuiz}
        onClose={() => setQuestionQuiz(null)}
        title={`Manage MCQ Questions — ${questionQuiz?.title || ''}`}
        size="xl"
      >
        <div className="space-y-6">
          <form onSubmit={handleAddQuestion} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Add New MCQ Question</h4>
            <Textarea
              label="Question Prompt"
              required
              rows={2}
              value={qForm.question_text}
              onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((num, idx) => (
                <div key={num} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={Number(qForm.correctIndex) === idx}
                    onChange={() => setQForm({ ...qForm, correctIndex: idx })}
                  />
                  <Input
                    placeholder={`Option ${num} ${Number(qForm.correctIndex) === idx ? '(Correct Answer)' : ''}`}
                    required={idx < 2}
                    value={qForm[`option${num}`]}
                    onChange={(e) => setQForm({ ...qForm, [`option${num}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Marks"
                type="number"
                value={qForm.marks}
                onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Explanation (Shown after submission)"
                  value={qForm.explanation}
                  onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" icon={Plus}>
                Add Question to Quiz
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {(questionQuiz?.questions || []).map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">
                    Q{idx + 1}. {q.question_text} ({q.marks} Marks)
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                  {(q.options || []).map((opt) => (
                    <div
                      key={opt.id}
                      className={`px-3 py-1.5 rounded-lg border ${
                        opt.is_correct
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {opt.option_text} {opt.is_correct ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
