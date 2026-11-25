import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  aos = 'fade-up',
  delay = 0,
}) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 text-white shadow-indigo-500/25',
    cyan: 'from-cyan-500 to-cyan-600 text-white shadow-cyan-500/25',
    violet: 'from-violet-500 to-violet-600 text-white shadow-violet-500/25',
    emerald: 'from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    amber: 'from-amber-500 to-amber-600 text-white shadow-amber-500/25',
    rose: 'from-rose-500 to-rose-600 text-white shadow-rose-500/25',
  };

  return (
    <div
      data-aos={aos}
      data-aos-delay={delay}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
              colors[color] || colors.indigo
            } flex items-center justify-center shadow-md shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
