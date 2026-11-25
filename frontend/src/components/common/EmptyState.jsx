import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Try adjusting your search or filter criteria, or create a new record.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}
