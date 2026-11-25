import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 px-6 border-t border-slate-200/70 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>© {new Date().getFullYear()} NexusLMS Enterprise — Production SaaS Learning Platform</span>
      <span>Powered by React 19 • Tailwind CSS 4 • FastAPI • SQLAlchemy 2.x • MySQL 8</span>
    </footer>
  );
}
