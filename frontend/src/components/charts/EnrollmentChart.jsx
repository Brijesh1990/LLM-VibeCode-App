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

export default function EnrollmentChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs" data-aos="fade-up">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Course Enrollment & Completion Analytics</h3>
        <p className="text-xs text-slate-500">Live student distribution and completion rate per course</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="students" name="Enrolled Students" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            <Bar dataKey="avg_completion" name="Avg Completion (%)" fill="#06B6D4" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
