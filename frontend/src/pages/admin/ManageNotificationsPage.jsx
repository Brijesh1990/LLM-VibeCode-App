import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Send } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { formatDateTime } from '../../utils/formatters';

export default function ManageNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    role_target: 'all',
    title: '',
    message: '',
    notification_type: 'general',
  });

  const loadNotifications = async () => {
    try {
      const res = await reportService.listNotifications({ limit: 100 });
      setNotifications(res.items || []);
    } catch {
      toast.error('Failed to load notifications.');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    await reportService.markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await reportService.markAllNotificationsRead();
    toast.success('All notifications marked as read.');
    loadNotifications();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await reportService.sendNotification(form);
      toast.success('Notification dispatched!');
      setModalOpen(false);
      setForm({ role_target: 'all', title: '', message: '', notification_type: 'general' });
      loadNotifications();
    } catch {
      toast.error('Failed to send notification.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Real-time alerts for courses, batches, lectures, evaluations, and institute updates"
        actions={
          <>
            <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
            {user?.role !== 'student' && (
              <Button size="sm" icon={Send} onClick={() => setModalOpen(true)}>
                Send Notification
              </Button>
            )}
          </>
        }
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No notifications in your inbox.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 ${
                !n.is_read ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    {!n.is_read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F46E5] text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{formatDateTime(n.created_at)}</p>
                </div>
              </div>
              {!n.is_read && (
                <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Dispatch Role-Based Notification"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <Select
            label="Target Audience"
            value={form.role_target}
            onChange={(e) => setForm({ ...form, role_target: e.target.value })}
          >
            <option value="all">All Institute Users</option>
            <option value="student">All Students</option>
            <option value="instructor">All Instructors</option>
          </Select>
          <Input
            label="Notification Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Notification Message"
            required
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Dispatch Notification</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
