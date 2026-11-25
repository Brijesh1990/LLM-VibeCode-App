import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

export default function AssignmentForm({
  initialData,
  courses = [],
  batches = [],
  onSubmit,
  onCancel,
  loading,
}) {
  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    course_id: initialData?.course_id || courses[0]?.id || '',
    batch_id: initialData?.batch_id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    instructions: initialData?.instructions || '',
    max_marks: initialData?.max_marks ?? 100,
    passing_marks: initialData?.passing_marks ?? 40,
    due_date: initialData?.due_date ? initialData.due_date.slice(0, 16) : defaultDue,
    allow_late_submission: initialData?.allow_late_submission ?? true,
    status: initialData?.status || 'published',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      course_id: Number(form.course_id),
      batch_id: form.batch_id ? Number(form.batch_id) : null,
      max_marks: Number(form.max_marks),
      passing_marks: Number(form.passing_marks),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Assignment Title"
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
          label="Target Batch (Optional)"
          value={form.batch_id}
          onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
        >
          <option value="">All Batches in Course</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label="Description"
        required
        rows={2}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Textarea
        label="Submission Instructions"
        rows={2}
        value={form.instructions}
        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Maximum Marks"
          type="number"
          required
          value={form.max_marks}
          onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
        />
        <Input
          label="Passing Marks"
          type="number"
          required
          value={form.passing_marks}
          onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
        />
        <Input
          label="Submission Deadline"
          type="datetime-local"
          required
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
      </div>
      <Checkbox
        label="Allow Late Submissions (Flagged as Late)"
        checked={form.allow_late_submission}
        onChange={(e) => setForm({ ...form, allow_late_submission: e.target.checked })}
      />
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Assignment' : 'Publish Assignment'}
        </Button>
      </div>
    </form>
  );
}
