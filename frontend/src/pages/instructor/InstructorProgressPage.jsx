import React, { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  Award,
  Download,
  FileSpreadsheet,
  Video,
  FileCheck2,
  BrainCircuit,
  CalendarCheck,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { exportTableToPDF } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';

export default function InstructorProgressPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [overallAttendance, setOverallAttendance] = useState(100);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [issuingKey, setIssuingKey] = useState(null);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (courseFilter) params.course_id = Number(courseFilter);
      if (batchFilter) params.batch_id = Number(batchFilter);

      const [progRes, crsRes, batRes] = await Promise.all([
        studentService.getProgress(params),
        courseService.listCourses({ instructor_id: user?.id }),
        batchService.listBatches(),
      ]);
      setItems(progRes.items || []);
      setOverallCompletion(progRes.overall_completion_percentage ?? 0);
      setOverallAttendance(progRes.overall_attendance_percentage ?? 100);
      setCourses(crsRes.items || []);
      setBatches(batRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load student progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, [courseFilter, batchFilter]);

  const filteredItems = useMemo(() => {
    return items.filter(
      (i) =>
        !search ||
        i.student_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.student_code?.toLowerCase().includes(search.toLowerCase()) ||
        i.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        i.batch_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const handleIssueCertificate = async (row) => {
    const key = `${row.student_id}-${row.course_id}`;
    try {
      setIssuingKey(key);
      const cert = await paymentService.generateCertificate({
        student_id: row.student_id,
        course_id: row.course_id,
        force_issue: true,
      });
      toast.success(
        `Certificate ${cert.certificate_number} issued to ${row.student_name}!`
      );
      await loadProgressData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to issue certificate');
    } finally {
      setIssuingKey(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Student Code',
      'Student Name',
      'Course',
      'Batch',
      'Lectures Completed',
      'Assignments Submitted',
      'Avg Assignment Score %',
      'Quizzes Completed',
      'Avg Quiz Score %',
      'Attendance %',
      'Completion %',
    ];
    const rows = filteredItems.map((i) => [
      i.student_code,
      `"${i.student_name}"`,
      `"${i.course_title}"`,
      `"${i.batch_name}"`,
      `${i.completed_lectures}/${i.total_lectures}`,
      `${i.submitted_assignments}/${i.total_assignments}`,
      i.avg_assignment_score,
      `${i.completed_quizzes}/${i.total_quizzes}`,
      i.avg_quiz_score,
      i.attendance_percentage,
      i.completion_percentage,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'student_progress_tracker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Student progress exported to CSV');
  };

  const handleExportPDF = () => {
    const cols = [
      'Student',
      'Course',
      'Batch',
      'Lectures',
      'Assignments',
      'Quizzes',
      'Attendance',
      'Completion',
    ];
    const rows = filteredItems.map((i) => [
      `${i.student_name} (${i.student_code})`,
      i.course_title,
      i.batch_name,
      `${i.completed_lectures}/${i.total_lectures}`,
      `${i.submitted_assignments}/${i.total_assignments} (${i.avg_assignment_score}%)`,
      `${i.completed_quizzes}/${i.total_quizzes} (${i.avg_quiz_score}%)`,
      `${i.attendance_percentage}%`,
      `${i.completion_percentage}%`,
    ]);
    exportTableToPDF(
      'Student Academic Progress Report',
      cols,
      rows,
      'instructor_student_progress.pdf'
    );
    toast.success('Progress report exported to PDF');
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student_name',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.student_name}</p>
          <p className="text-xs text-slate-500">
            {row.student_code} • {row.student_email}
          </p>
        </div>
      ),
    },
    {
      header: 'Course & Batch',
      accessor: 'course_title',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.course_title}</p>
          <p className="text-xs text-slate-500">{row.batch_name}</p>
        </div>
      ),
    },
    {
      header: 'Lectures',
      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.completed_lectures} / {row.total_lectures}
        </span>
      ),
    },
    {
      header: 'Assignments',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">
            {row.submitted_assignments} / {row.total_assignments}
          </p>
          <p className="text-slate-400">Avg: {row.avg_assignment_score}%</p>
        </div>
      ),
    },
    {
      header: 'Quizzes',
      render: (row) => (
        <div className="text-xs">
          <p className="font-bold text-slate-800">
            {row.completed_quizzes} / {row.total_quizzes}
          </p>
          <p className="text-slate-400">Avg: {row.avg_quiz_score}%</p>
        </div>
      ),
    },
    {
      header: 'Attendance',
      accessor: 'attendance_percentage',
      render: (row) => (
        <Badge variant={row.attendance_percentage >= 75 ? 'green' : 'amber'}>
          {row.attendance_percentage}%
        </Badge>
      ),
    },
    {
      header: 'Completion',
      accessor: 'completion_percentage',
      render: (row) => (
        <div className="w-36">
          <ProgressBar
            value={row.completion_percentage || 0}
            size="sm"
            color={row.is_eligible_for_certificate ? 'emerald' : 'indigo'}
          />
        </div>
      ),
    },
    {
      header: 'Certification',
      render: (row) => {
        const key = `${row.student_id}-${row.course_id}`;
        return (
          <Button
            size="sm"
            variant={row.is_eligible_for_certificate ? 'success' : 'outline'}
            icon={Award}
            loading={issuingKey === key}
            onClick={() => handleIssueCertificate(row)}
          >
            Issue Certificate
          </Button>
        );
      },
    },
  ];

  const eligibleCount = filteredItems.filter((i) => i.is_eligible_for_certificate).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprehensive Student Progress Tracker"
        subtitle="Track lecture completion, assignment grades, quiz averages, attendance rates, and issue course completion certificates."
        badge={<Badge variant="indigo">{filteredItems.length} Enrollments</Badge>}
        actions={
          <>
            <Button variant="outline" icon={FileSpreadsheet} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" icon={Download} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Cohort Mean Completion"
          value={`${overallCompletion}%`}
          subtitle="Weighted Syllabus Progress"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Cohort Mean Attendance"
          value={`${overallAttendance}%`}
          subtitle="(Present / Eligible) × 100"
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Eligible for Certification"
          value={eligibleCount}
          subtitle="Students Meeting Threshold"
          icon={Award}
          color="violet"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by student name, ID, course, or batch..."
        />
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Assigned Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
          <option value="">All Assigned Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Loader text="Calculating cohort progress metrics..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          emptyTitle="No student progress records found"
          emptyDescription="Adjust your course or batch filter to view student progress."
        />
      )}
    </div>
  );
}
