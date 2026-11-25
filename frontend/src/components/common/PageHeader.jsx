import React from 'react';
import Breadcrumb from './Breadcrumb';

export default function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="mb-6" data-aos="fade-down">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}
