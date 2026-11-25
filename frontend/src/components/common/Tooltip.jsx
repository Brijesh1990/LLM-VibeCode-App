import React from 'react';

export default function Tooltip({ text, children }) {
  return (
    <div className="group relative inline-flex">
      {children}
      {text && (
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-50">
          {text}
        </span>
      )}
    </div>
  );
}
