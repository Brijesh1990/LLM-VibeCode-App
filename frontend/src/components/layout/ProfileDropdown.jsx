import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCog, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profilePath = `/${user?.role || 'student'}/profile`;

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <Avatar name={user?.full_name || 'User'} src={user?.avatar_url} size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name}</p>
            <p className="text-[11px] font-medium text-[#4F46E5] uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      }
    >
      <div className="px-4 py-2.5 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name}</p>
        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
      </div>
      <Link
        to={profilePath}
        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <UserCog className="w-4 h-4 text-slate-400" />
        Profile & Password
      </Link>
      {user?.role === 'admin' && (
        <Link
          to="/admin/settings"
          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          System Settings
        </Link>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </Dropdown>
  );
}
