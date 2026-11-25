import React from 'react';

export default function Checkbox({ label, checked, onChange, className = '', ...props }) {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
        {...props}
      />
      {label && <span className="text-sm text-slate-700 font-medium">{label}</span>}
    </label>
  );
}
