import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Lock } from 'lucide-react';
import { registerSchema } from '../../validations/schemas';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

export default function RegisterForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'student',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="Alex Rivera"
        icon={User}
        error={errors.full_name?.message}
        {...register('full_name')}
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="alex@university.edu"
        icon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Phone Number"
          placeholder="+1 (415) 555-0192"
          icon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select label="Account Role" error={errors.role?.message} {...register('role')}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </Select>
      </div>
      <Input
        label="Password"
        type="password"
        placeholder="Minimum 6 characters"
        icon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" loading={loading} className="w-full py-2.5">
        Create Institute Account
      </Button>
    </form>
  );
}
