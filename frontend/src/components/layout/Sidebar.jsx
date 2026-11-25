import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import {
  ADMIN_NAV_ITEMS,
  INSTRUCTOR_NAV_ITEMS,
  STUDENT_NAV_ITEMS,
} from '../../constants';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ collapsed = false }) {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const navItems =
    role === 'admin'
      ? ADMIN_NAV_ITEMS
      : role === 'instructor'
      ? INSTRUCTOR_NAV_ITEMS
      : STUDENT_NAV_ITEMS;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0 transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-black text-base shadow-md">
          NX
        </div>
        {!collapsed && (
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">NexusLMS</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
              {role} Portal
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const IconComponent = Icons[item.icon] || Icons.CircleDot;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <IconComponent className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
          <p className="text-xs font-bold text-white">Enterprise Edition</p>
          <p className="text-[11px] text-slate-400 mt-0.5">React 19 • FastAPI • MySQL 8</p>
        </div>
      )}
    </aside>
  );
}
