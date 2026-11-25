import React from 'react';

export default function StatusBadge({ status }) {
  const s = String(status || 'active').toLowerCase();
  const map = {
    active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    published: { label: 'Published', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    present: { label: 'Present', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    completed: { label: 'Completed', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    evaluated: { label: 'Evaluated', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    submitted: { label: 'Submitted', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    upcoming: { label: 'Upcoming', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    partially_paid: { label: 'Partially Paid', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    under_review: { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    late: { label: 'Late', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    late_submission: { label: 'Late Submission', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved_leave: { label: 'Approved Leave', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    absent: { label: 'Absent', cls: 'bg-red-50 text-red-700 border-red-200' },
    failed: { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
    closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-700 border-slate-300' },
    archived: { label: 'Archived', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    refunded: { label: 'Refunded', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  };
  const cfg = map[s] || { label: String(status || 'Unknown'), cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
