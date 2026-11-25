import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], children, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full rounded-xl border ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#4F46E5]'
        } bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all ${className}`}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
