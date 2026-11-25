import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2 } from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';

export default function ManageSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [evalForm, setEvalForm] = useState({
    marks_obtained: 85,
    feedback_text: '',
    rubric_notes: '',
  });
  const [saving, setSaving] = useState(false);

  const loadSubmissions = async () => {
    try {
      const res = await assignmentService.listSubmissions();
      setSubmissions(res.items || []);
    } catch {
      toast.error('Failed to load submissions.');
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const openEvaluate = (sub) => {
    setSelected(sub);
    setEvalForm({
      marks_obtained: sub.marks_obtained ?? Math.round((sub.max_marks || 100) * 0.85),
      feedback_text: sub.feedback_text || 'Well-structured solution meeting architectural requirements.',
      rubric_notes: sub.rubric_notes || 'Architecture: 45/50 | Code Quality: 40/50',
    });
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await assignmentService.evaluateSubmission(selected.id, {
        marks_obtained: Number(evalForm.marks_obtained),
        feedback_text: evalForm.feedback_text,
        rubric_notes: evalForm.rubric_notes,
      });
      toast.success('Submission evaluated and marks recorded!');
      setSelected(null);
      loadSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Evaluation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review & Evaluate Student Submissions"
        subtitle="Inspect submitted assignments, award marks, and provide detailed faculty feedback"
      />

      <DataTable
        data={submissions}
        columns={[
          {
            header: 'Student',
            accessor: 'student_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.student_name}</p>
                <p className="text-xs text-slate-500">{r.student_email}</p>
              </div>
            ),
          },
          {
            header: 'Assignment',
            accessor: 'assignment_title',
            render: (r) => (
              <div>
                <p className="font-semibold text-slate-900">{r.assignment_title}</p>
                <p className="text-xs text-slate-500">{r.course_title}</p>
              </div>
            ),
          },
          {
            header: 'Submitted At',
            render: (r) => formatDateTime(r.submitted_at),
          },
          {
            header: 'Marks',
            render: (r) =>
              r.marks_obtained !== null && r.marks_obtained !== undefined ? (
                <span className="font-extrabold text-emerald-700">
                  {r.marks_obtained} / {r.max_marks}
                </span>
              ) : (
                <span className="text-xs text-amber-600 font-semibold">Awaiting Grade</span>
              ),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: 'Action',
            render: (r) => (
              <Button
                size="sm"
                variant={r.status === 'evaluated' ? 'outline' : 'primary'}
                icon={CheckCircle2}
                onClick={() => openEvaluate(r)}
              >
                {r.status === 'evaluated' ? 'Re-Evaluate' : 'Evaluate'}
              </Button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Evaluate Submission — ${selected?.student_name || ''}`}
        subtitle={selected?.assignment_title}
      >
        {selected && (
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p className="font-bold text-slate-700">Student Submission Response:</p>
              <p className="text-slate-600 whitespace-pre-wrap">
                {selected.submission_text || 'File submission attached.'}
              </p>
              {selected.file_name && (
                <p className="font-semibold text-[#4F46E5]">Attached File: {selected.file_name}</p>
              )}
            </div>

            <Input
              label={`Awarded Marks (Max: ${selected.max_marks})`}
              type="number"
              step="0.5"
              max={selected.max_marks}
              min={0}
              required
              value={evalForm.marks_obtained}
              onChange={(e) => setEvalForm({ ...evalForm, marks_obtained: e.target.value })}
            />
            <Textarea
              label="Instructor Feedback"
              required
              rows={3}
              value={evalForm.feedback_text}
              onChange={(e) => setEvalForm({ ...evalForm, feedback_text: e.target.value })}
            />
            <Input
              label="Rubric Breakdown Notes"
              value={evalForm.rubric_notes}
              onChange={(e) => setEvalForm({ ...evalForm, rubric_notes: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Submit Evaluation & Notify Student
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
