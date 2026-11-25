import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, hint, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border ${
            error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-[#4F46E5]'
          } bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
            Icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
