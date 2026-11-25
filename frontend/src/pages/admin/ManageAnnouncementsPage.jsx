import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Megaphone, Pin } from 'lucide-react';
import { reportService } from '../../services/reportService';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Checkbox from '../../components/common/Checkbox';
import { formatDateTime } from '../../utils/formatters';

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target_role: 'all',
    is_pinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      const res = await reportService.listAnnouncements();
      setAnnouncements(res.items || []);
    } catch {
      toast.error('Failed to load announcements.');
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await reportService.createAnnouncement(form);
      toast.success('Announcement published!');
      setModalOpen(false);
      setForm({ title: '', content: '', target_role: 'all', is_pinned: false });
      loadAnnouncements();
    } catch {
      toast.error('Failed to publish announcement.');
    }
  };

  const handleDelete = async (id) => {
    await reportService.deleteAnnouncement(id);
    toast.success('Announcement removed.');
    loadAnnouncements();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute & Cohort Announcements"
        subtitle="Broadcast important notices to students, instructors, or specific batches"
        actions={
          <Button size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
            New Announcement
          </Button>
        }
      />

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            data-aos="fade-up"
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                  {a.is_pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-[#4F46E5]">
                    Audience: {a.target_role}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">{a.content}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Published by {a.author_name} • {formatDateTime(a.created_at)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(a.id)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Institute Announcement"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Announcement Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Select
            label="Target Role"
            value={form.target_role}
            onChange={(e) => setForm({ ...form, target_role: e.target.value })}
          >
            <option value="all">All Roles</option>
            <option value="student">Students Only</option>
            <option value="instructor">Instructors Only</option>
          </Select>
          <Textarea
            label="Announcement Content"
            required
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <Checkbox
            label="Pin to Top of Bulletin Board"
            checked={form.is_pinned}
            onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Announcement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
