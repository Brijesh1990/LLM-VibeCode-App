import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  ADMIN_NAV_ITEMS,
  INSTRUCTOR_NAV_ITEMS,
  STUDENT_NAV_ITEMS,
} from '../../constants';
import { useAuth } from '../../hooks/useAuth';

export default function MobileSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  if (!isOpen) return null;

  const role = user?.role || 'student';
  const navItems =
    role === 'admin'
      ? ADMIN_NAV_ITEMS
      : role === 'instructor'
      ? INSTRUCTOR_NAV_ITEMS
      : STUDENT_NAV_ITEMS;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-72 max-w-xs bg-[#0F172A] text-slate-200 h-full flex flex-col z-10 shadow-2xl">
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white font-black text-sm">
              NX
            </div>
            <span className="font-extrabold text-white">NexusLMS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const IconComponent = Icons[item.icon] || Icons.CircleDot;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
