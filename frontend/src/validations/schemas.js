import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'instructor']).default('student'),
});

export const courseSchema = z.object({
  title: z.string().min(3, 'Course title is required'),
  course_code: z.string().optional(),
  category_id: z.coerce.number().min(1, 'Please select a category'),
  instructor_id: z.coerce.number().optional().nullable(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration_weeks: z.coerce.number().min(1).default(12),
  duration_hours: z.coerce.number().min(1).default(60),
  fee: z.coerce.number().min(0).default(0),
  level: z.string().default('Intermediate'),
  status: z.string().default('published'),
  completion_threshold_pct: z.coerce.number().min(10).max(100).default(75),
});

export const batchSchema = z.object({
  name: z.string().min(2, 'Batch name is required'),
  batch_code: z.string().optional(),
  course_id: z.coerce.number().min(1, 'Course is required'),
  instructor_id: z.coerce.number().optional().nullable(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  class_days: z.string().min(2, 'Class days are required'),
  class_timing: z.string().min(2, 'Class timing is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  status: z.string().default('active'),
});
