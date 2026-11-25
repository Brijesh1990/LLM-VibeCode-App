import React, { useState } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

export default function InstructorForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    department: initialData?.department || 'Computer Science & Engineering',
    designation: initialData?.designation || 'Senior Faculty',
    qualification: initialData?.qualification || 'Ph.D. / M.Tech',
    specialization: initialData?.specialization || 'Full-Stack & Cloud Architecture',
    experience_years: initialData?.experience_years ?? 5,
    bio: initialData?.bio || '',
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, role: 'instructor' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Instructor Full Name"
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          label="Email Address"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Input
          label={initialData ? 'New Password (Optional)' : 'Initial Password'}
          type="password"
          placeholder={initialData ? 'Leave blank to keep existing' : 'Default: Instructor@123'}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <Input
          label="Designation"
          value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Qualification"
          value={form.qualification}
          onChange={(e) => setForm({ ...form, qualification: e.target.value })}
        />
        <Input
          label="Specialization"
          value={form.specialization}
          onChange={(e) => setForm({ ...form, specialization: e.target.value })}
        />
        <Input
          label="Experience (Years)"
          type="number"
          value={form.experience_years}
          onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
        />
      </div>
      <Textarea
        label="Faculty Bio"
        rows={2}
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <Checkbox
        label="Active Faculty Status"
        checked={form.is_active}
        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
      />
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Instructor' : 'Add Instructor'}
        </Button>
      </div>
    </form>
  );
}
