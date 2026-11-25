import React, { forwardRef } from 'react';

const Textarea = forwardRef(({ label, error, rows = 3, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-xl border ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4F46E5]'
        } bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
