import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3">
      <Link to="/" className="hover:text-[#4F46E5] flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {segments.map((seg, idx) => {
        const path = '/' + segments.slice(0, idx + 1).join('/');
        const isLast = idx === segments.length - 1;
        const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast ? (
              <span className="text-slate-800 font-semibold">{label}</span>
            ) : (
              <Link to={path} className="hover:text-[#4F46E5]">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
