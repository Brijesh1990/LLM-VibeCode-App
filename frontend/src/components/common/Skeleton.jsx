import React from 'react';

export default function Skeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-200/70 rounded-xl w-full" />
      ))}
    </div>
  );
}
