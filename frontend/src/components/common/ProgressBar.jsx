import React from 'react';

export default function ProgressBar({ value = 0, label, showValue = true, color = 'indigo', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, Number(value || 0)));
  const colors = {
    indigo: 'bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6]',
    cyan: 'bg-gradient-to-r from-[#06B6D4] to-[#4F46E5]',
    emerald: 'bg-[#16A34A]',
    amber: 'bg-[#F59E0B]',
  };
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && <span className="text-slate-900">{pct.toFixed(1)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color] || colors.indigo}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
