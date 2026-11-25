import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema } from '../../validations/schemas';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

export default function CourseForm({
  initialData,
  categories = [],
  instructors = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      title: '',
      course_code: '',
      category_id: categories[0]?.id || 1,
      instructor_id: instructors[0]?.id || '',
      description: '',
      duration_weeks: 12,
      duration_hours: 60,
      fee: 1200,
      level: 'Intermediate',
      status: 'published',
      completion_threshold_pct: 75,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Course Name / Title"
            placeholder="Enterprise Cloud & Microservices"
            error={errors.title?.message}
            {...register('title')}
          />
        </div>
        <Input
          label="Course Code"
          placeholder="CRS-CL-501"
          error={errors.course_code?.message}
          {...register('course_code')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Category" error={errors.category_id?.message} {...register('category_id')}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Assigned Instructor" {...register('instructor_id')}>
          <option value="">Select Instructor</option>
          {instructors.map((ins) => (
            <option key={ins.id} value={ins.id}>
              {ins.full_name}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Course Description"
        rows={3}
        placeholder="Comprehensive syllabus and learning outcomes..."
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Input label="Weeks" type="number" {...register('duration_weeks')} />
        <Input label="Total Hours" type="number" {...register('duration_hours')} />
        <Input label="Course Fee ($)" type="number" step="0.01" {...register('fee')} />
        <Input label="Pass Threshold %" type="number" {...register('completion_threshold_pct')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Difficulty Level" {...register('level')}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </Select>
        <Select label="Publication Status" {...register('status')}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Save Changes' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
