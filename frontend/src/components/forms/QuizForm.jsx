import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

export default function QuizForm({
  initialData,
  courses = [],
  batches = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    course_id: initialData?.course_id || courses[0]?.id || '',
    batch_id: initialData?.batch_id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructions: initialData?.instructions || 'Scores are calculated on the backend upon submission.',
    total_marks: initialData?.total_marks ?? 100,
    passing_marks: initialData?.passing_marks ?? 40,
    duration_minutes: initialData?.duration_minutes ?? 30,
    max_attempts: initialData?.max_attempts ?? 2,
    allow_retake: initialData?.allow_retake ?? true,
    status: initialData?.status || 'published',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      course_id: Number(form.course_id),
      batch_id: form.batch_id ? Number(form.batch_id) : null,
      total_marks: Number(form.total_marks),
      passing_marks: Number(form.passing_marks),
      duration_minutes: Number(form.duration_minutes),
      max_attempts: Number(form.max_attempts),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Quiz / Examination Title"
        required
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Course"
          value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select
          label="Batch (Optional)"
          value={form.batch_id}
          onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label="Description & Instructions"
        rows={2}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input
          label="Total Marks"
          type="number"
          value={form.total_marks}
          onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
        />
        <Input
          label="Passing Marks"
          type="number"
          value={form.passing_marks}
          onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
        />
        <Input
          label="Duration (Mins)"
          type="number"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
        />
        <Input
          label="Max Attempts"
          type="number"
          value={form.max_attempts}
          onChange={(e) => setForm({ ...form, max_attempts: e.target.value })}
        />
      </div>
      <Checkbox
        label="Allow Retake Within Attempt Limit"
        checked={form.allow_retake}
        onChange={(e) => setForm({ ...form, allow_retake: e.target.checked })}
      />
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Save Quiz' : 'Create Quiz'}
        </Button>
      </div>
    </form>
  );
}
