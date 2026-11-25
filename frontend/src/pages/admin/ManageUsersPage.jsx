import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { studentService } from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { confirmAction } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student',
    password: '',
    is_active: true,
  });

  const loadUsers = async () => {
    try {
      const res = await studentService.listUsers({
        search,
        role: roleFilter || undefined,
      });
      setUsers(res.items || []);
    } catch {
      toast.error('Failed to load users.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const openModal = (u = null) => {
    setEditing(u);
    setForm({
      full_name: u?.full_name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      role: u?.role || 'student',
      password: '',
      is_active: u?.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await studentService.updateUser(editing.id, form);
        toast.success('User account updated!');
      } else {
        await studentService.createUser(form);
        toast.success('User account created!');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not save user.');
    }
  };

  const handleDelete = async (u) => {
    const ok = await confirmAction({
      title: `Deactivate ${u.full_name}?`,
      text: 'This user account will be deactivated.',
    });
    if (!ok) return;
    try {
      await studentService.deleteUser(u.id);
      toast.success('User deactivated.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Unable to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage All Users & Roles"
        subtitle="Centralized directory of Administrators, Instructors, and Students"
        actions={
          <Button size="sm" icon={Plus} onClick={() => openModal(null)}>
            Create User
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
          className="max-w-md w-full"
        />
        <div className="w-48">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </Select>
        </div>
      </div>

      <DataTable
        data={users}
        columns={[
          { header: 'ID', accessor: 'id' },
          {
            header: 'User',
            accessor: 'full_name',
            render: (r) => (
              <div>
                <p className="font-bold text-slate-900">{r.full_name}</p>
                <p className="text-xs text-slate-500">{r.email}</p>
              </div>
            ),
          },
          {
            header: 'Role',
            accessor: 'role',
            render: (r) => (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-[#4F46E5]">
                {r.role}
              </span>
            ),
          },
          { header: 'Phone', accessor: 'phone' },
          {
            header: 'Created',
            render: (r) => formatDate(r.created_at),
          },
          {
            header: 'Status',
            render: (r) => <StatusBadge status={r.is_active ? 'active' : 'closed'} />,
          },
          {
            header: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openModal(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] hover:bg-indigo-50 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User Account' : 'Create User Account'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Input
            label={editing ? 'Reset Password (Optional)' : 'Password'}
            type="password"
            placeholder={editing ? 'Leave blank to keep unchanged' : 'Welcome@123'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Update User' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
