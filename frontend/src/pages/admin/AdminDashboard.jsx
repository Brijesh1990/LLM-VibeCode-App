import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CalendarRange,
  ClipboardCheck,
  DollarSign,
  AlertCircle,
  FileCheck2,
  Plus,
  BarChart3,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EnrollmentChart from '../../components/charts/EnrollmentChart';
import RevenueChart from '../../components/charts/RevenueChart';
import AttendanceChart from '../../components/charts/AttendanceChart';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService
      .getDashboardKPIs()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading enterprise institute metrics..." />;

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institute Executive Dashboard"
        subtitle="Real-time overview of students, faculty, courses, cohorts, revenue, and academic KPIs"
        actions={
          <>
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Course
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
            >
              <BarChart3 className="w-4 h-4 text-[#06B6D4]" /> Export Reports
            </Link>
          </>
        }
      />

      {/* 9 Required Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={kpis.total_students ?? 0}
          subtitle="Active enrolled scholars"
          icon={GraduationCap}
          color="indigo"
          delay={0}
        />
        <StatCard
          title="Total Instructors"
          value={kpis.total_instructors ?? 0}
          subtitle="Assigned faculty members"
          icon={UserCheck}
          color="cyan"
          delay={50}
        />
        <StatCard
          title="Total Courses"
          value={kpis.total_courses ?? 0}
          subtitle={`${kpis.active_batches ?? 0} active batches of ${kpis.total_batches ?? 0}`}
          icon={BookOpen}
          color="violet"
          delay={100}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(kpis.total_revenue)}
          subtitle={`Pending fees: ${formatCurrency(kpis.pending_fees)}`}
          icon={DollarSign}
          color="emerald"
          delay={150}
        />
        <StatCard
          title="Total Enrollments"
          value={kpis.total_enrollments ?? 0}
          subtitle={`${kpis.pending_evaluations ?? 0} pending evaluations`}
          icon={ClipboardCheck}
          color="amber"
          delay={200}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data?.revenue_analytics || []} />
        <EnrollmentChart data={data?.course_performance || []} />
      </div>

      {/* Batch Statistics & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <AttendanceChart data={data?.batch_statistics || []} />
        </div>
        <div className="lg:col-span-7" data-aos="fade-up">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Batch-Wise Cohort Statistics</h3>
                <p className="text-xs text-slate-500">Capacity utilization and live attendance rate</p>
              </div>
              <Link to="/admin/batches" className="text-xs font-bold text-[#4F46E5] hover:underline">
                Manage Batches →
              </Link>
            </div>
            <DataTable
              pageSize={5}
              data={data?.batch_statistics || []}
              columns={[
                { header: 'Batch Name', accessor: 'name' },
                { header: 'Course', accessor: 'course_title' },
                {
                  header: 'Seats',
                  render: (r) => (
                    <span className="font-semibold">
                      {r.enrolled} / {r.capacity}
                    </span>
                  ),
                },
                {
                  header: 'Attendance',
                  render: (r) => (
                    <span className="font-bold text-emerald-700">{r.attendance_pct}%</span>
                  ),
                },
                {
                  header: 'Status',
                  render: (r) => <StatusBadge status={r.status} />,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs" data-aos="fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Account Registrations</h3>
            <p className="text-xs text-slate-500">Latest student, instructor, and admin accounts</p>
          </div>
          <Link to="/admin/users" className="text-xs font-bold text-[#4F46E5] hover:underline">
            View All Users →
          </Link>
        </div>
        <DataTable
          pageSize={6}
          data={data?.recent_registrations || []}
          columns={[
            { header: 'Full Name', accessor: 'full_name' },
            { header: 'Email Address', accessor: 'email' },
            {
              header: 'Role',
              render: (r) => (
                <span className="uppercase text-xs font-bold text-[#4F46E5]">{r.role}</span>
              ),
            },
            {
              header: 'Registered On',
              render: (r) => formatDate(r.created_at),
            },
            {
              header: 'Status',
              render: (r) => <StatusBadge status={r.is_active ? 'active' : 'closed'} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
