import React from 'react';
import Button from '../common/Button';

export default function AttendanceForm({
  roster = [],
  statuses = {},
  onStatusChange,
  onSave,
  loading,
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Mark Attendance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roster.map((stu) => {
              const current = statuses[stu.id] || 'present';
              return (
                <tr key={stu.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{stu.full_name}</td>
                  <td className="px-4 py-3 text-slate-500">{stu.student_code}</td>
                  <td className="px-4 py-3">
                    <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-1">
                      {['present', 'absent', 'late', 'approved_leave'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => onStatusChange(stu.id, st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                            current === st
                              ? st === 'present'
                                ? 'bg-[#16A34A] text-white'
                                : st === 'absent'
                                ? 'bg-[#EF4444] text-white'
                                : 'bg-[#4F46E5] text-white'
                              : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} loading={loading}>
          Save Cohort Attendance
        </Button>
      </div>
    </div>
  );
}
