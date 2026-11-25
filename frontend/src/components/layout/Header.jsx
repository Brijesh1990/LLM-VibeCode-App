import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

export default function Header({ onOpenMobileMenu }) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-[#4F46E5] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            Live MySQL 8 Connected
          </span>
          <Link
            to="/verify-certificate/CERT-2026-01005"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
            Public Certificate Verification
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
