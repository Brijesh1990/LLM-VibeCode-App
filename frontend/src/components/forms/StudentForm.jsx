import React, { useState } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Checkbox from '../common/Checkbox';
import Button from '../common/Button';

export default function StudentForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    address: initialData?.address || '',
    bio: initialData?.bio || '',
    is_active: initialData?.is_active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, role: 'student' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Student Full Name"
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
          placeholder={initialData ? 'Leave blank to keep existing' : 'Default: Student@123'}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <Input
        label="Address / City"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <Textarea
        label="Academic Bio / Notes"
        rows={2}
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <Checkbox
        label="Active Student Account"
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
          {initialData ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
}
