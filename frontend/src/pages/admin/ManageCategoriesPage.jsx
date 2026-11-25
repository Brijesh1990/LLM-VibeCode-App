import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { courseService } from '../../services/courseService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import StatusBadge from '../../components/common/StatusBadge';
import { confirmAction } from '../../components/common/ConfirmDialog';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_active: true });

  const loadCategories = async () => {
    try {
      const res = await courseService.listCategories();
      setCategories(res.items || []);
    } catch {
      toast.error('Failed to load categories.');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await courseService.updateCategory(editing.id, form);
        toast.success('Category updated!');
      } else {
        await courseService.createCategory(form);
        toast.success('Category created!');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Save failed.');
    }
  };

  const handleDelete = async (cat) => {
    const ok = await confirmAction({
      title: `Delete category "${cat.name}"?`,
      text: 'Categories with active courses cannot be deleted.',
    });
    if (!ok) return;
    try {
      await courseService.deleteCategory(cat.id);
      toast.success('Category deleted.');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete category with active courses.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Categories"
        subtitle="Organize courses into domains and specializations"
        actions={
          <Button
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setForm({ name: '', description: '', is_active: true });
              setModalOpen(true);
            }}
          >
            New Category
          </Button>
        }
      />

      <DataTable
        data={categories}
        columns={[
          { header: 'ID', accessor: 'id' },
          {
            header: 'Category Name',
            accessor: 'name',
            render: (r) => <span className="font-bold text-slate-900">{r.name}</span>,
          },
          { header: 'Slug', accessor: 'slug' },
          { header: 'Description', accessor: 'description' },
          {
            header: 'Courses Count',
            accessor: 'courses_count',
            render: (r) => <span className="font-bold text-[#4F46E5]">{r.courses_count}</span>,
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
                  onClick={() => {
                    setEditing(r);
                    setForm({ name: r.name, description: r.description, is_active: r.is_active });
                    setModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#4F46E5] cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 cursor-pointer"
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
        title={editing ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
