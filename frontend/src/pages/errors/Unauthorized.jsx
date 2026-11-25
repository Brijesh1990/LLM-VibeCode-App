import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../constants';

export default function Unauthorized() {
  const { user } = useAuth();
  const home = user ? ROLE_HOME_PATHS[user.role] : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="bg-white rounded-3xl border border-red-200 shadow-xl max-w-md w-full p-8 text-center" data-aos="zoom-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#EF4444]">Error 403</span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Access Restricted</h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Your current role (<strong className="uppercase">{user?.role || 'Guest'}</strong>) does not have permission to access this module.
        </p>
        <Link
          to={home}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
        </Link>
      </div>
    </div>
  );
}
