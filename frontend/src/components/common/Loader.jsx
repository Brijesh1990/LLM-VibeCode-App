import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading NexusLMS data...', fullScreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? 'min-h-screen bg-[#F8FAFC]' : 'py-16'
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#4F46E5] shadow-sm">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{text}</p>
    </div>
  );
}
