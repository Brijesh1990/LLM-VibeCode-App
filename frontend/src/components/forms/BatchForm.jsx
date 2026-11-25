import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { batchSchema } from '../../validations/schemas';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

export default function BatchForm({
  initialData,
  courses = [],
  instructors = [],
  onSubmit,
  onCancel,
  loading = false,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: initialData || {
      name: '',
      batch_code: '',
      course_id: courses[0]?.id || 1,
      instructor_id: instructors[0]?.id || '',
      start_date: today,
      end_date: today,
      class_days: 'Mon, Wed, Fri',
      class_timing: '10:00 AM - 12:00 PM',
      capacity: 30,
      status: 'active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Batch / Cohort Name"
            placeholder="Full-Stack Cohort Delta"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>
        <Input label="Batch Code" placeholder="BAT-2026-D" {...register('batch_code')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select label="Course" error={errors.course_id?.message} {...register('course_id')}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select label="Assigned Instructor" {...register('instructor_id')}>
          <option value="">Select Instructor</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.full_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" error={errors.start_date?.message} {...register('start_date')} />
        <Input label="End Date" type="date" error={errors.end_date?.message} {...register('end_date')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Class Days" placeholder="Mon, Wed, Fri" {...register('class_days')} />
        <Input label="Class Timing" placeholder="10:00 AM - 12:00 PM" {...register('class_timing')} />
        <Input label="Max Capacity" type="number" {...register('capacity')} />
      </div>

      <Select label="Status" {...register('status')}>
        <option value="active">Active</option>
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
        <option value="closed">Closed</option>
        <option value="archived">Archived</option>
      </Select>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Batch' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
}
