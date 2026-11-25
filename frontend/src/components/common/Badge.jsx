import React from 'react';

export default function Badge({ children, variant = 'indigo', className = '' }) {
  const variants = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variants[variant] || variants.indigo
      } ${className}`}
    >
      {children}
    </span>
  );
}
