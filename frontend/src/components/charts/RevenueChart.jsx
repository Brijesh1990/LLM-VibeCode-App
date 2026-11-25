import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function RevenueChart({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs" data-aos="fade-up">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Revenue & Tuition Collection Analytics</h3>
        <p className="text-xs text-slate-500">Database-driven fee collection and monthly enrollment velocity</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Collected Revenue ($)"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fill="url(#revGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
