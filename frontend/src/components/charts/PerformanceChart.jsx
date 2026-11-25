import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function PerformanceChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs" data-aos="fade-up">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Student Academic Performance</h3>
        <p className="text-xs text-slate-500">Progress and evaluation scores across courses</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="course_title" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="avg_progress" name="Avg Completion %" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
