import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';
import Dropdown from '../common/Dropdown';
import { formatDateTime } from '../../utils/formatters';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await reportService.listNotifications({ limit: 8 });
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await reportService.markAllNotificationsRead();
      await loadNotifications();
    } catch {
      // silent
    }
  };

  const notifPath = `/${user?.role || 'student'}/notifications`;

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#4F46E5] hover:bg-indigo-50/70 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="w-80 max-h-96 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Notifications ({unreadCount})
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-[#4F46E5] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-64">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`px-4 py-2.5 text-left ${!n.is_read ? 'bg-indigo-50/40' : ''}`}
              >
                <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-center">
          <Link
            to={notifPath}
            className="text-xs font-semibold text-[#4F46E5] hover:underline block"
          >
            View Notification Center →
          </Link>
        </div>
      </div>
    </Dropdown>
  );
}
