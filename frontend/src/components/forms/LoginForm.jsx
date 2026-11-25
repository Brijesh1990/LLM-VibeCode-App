import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { loginSchema } from '../../validations/schemas';
import Input from '../common/Input';
import Button from '../common/Button';

export default function LoginForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const fillDemo = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="name@lms.com"
        icon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={loading} className="w-full py-2.5" icon={ArrowRight}>
        Sign In to Portal
      </Button>

      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
          Quick Demo Credentials (One-Click Fill)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('admin@lms.com', 'Admin@123')}
            className="px-2.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-bold text-[#4F46E5] transition-colors cursor-pointer"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemo('instructor@lms.com', 'Instructor@123')}
            className="px-2.5 py-2 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-xs font-bold text-cyan-700 transition-colors cursor-pointer"
          >
            Instructor
          </button>
          <button
            type="button"
            onClick={() => fillDemo('student@lms.com', 'Student@123')}
            className="px-2.5 py-2 rounded-xl border border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-xs font-bold text-violet-700 transition-colors cursor-pointer"
          >
            Student
          </button>
        </div>
      </div>
    </form>
  );
}
