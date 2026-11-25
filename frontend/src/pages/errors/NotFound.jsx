import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md w-full p-8 text-center" data-aos="zoom-in">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#4F46E5]">Error 404</span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Page Not Found</h1>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The page or resource you requested does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-sm font-semibold shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
}
