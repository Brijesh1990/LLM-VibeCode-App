import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  CalendarCheck,
  Eye,
  Download,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import { useAuth } from '../../hooks/useAuth';
import { exportTableToPDF } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export default function InstructorStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (courseFilter) params.course_id = Number(courseFilter);
      if (batchFilter) params.batch_id = Number(batchFilter);

      const [stuRes, crsRes, batRes] = await Promise.all([
        studentService.listStudents(params),
        courseService.listCourses({ instructor_id: user?.id }),
        batchService.listBatches(),
      ]);
      setStudents(stuRes.items || []);
      setCourses(crsRes.items || []);
      setBatches(batRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [courseFilter, batchFilter, search]);

  const handleExportPDF = () => {
    const cols = ['Student ID', 'Full Name', 'Email', 'Phone', 'Courses', 'Attendance %', 'Avg Progress %'];
    const rows = students.map((s) => [
      s.student_code,
      s.full_name,
      s.email,
      s.phone || '—',
      s.enrolled_courses_count ?? 0,
      `${s.attendance_percentage ?? 100}%`,
      `${s.avg_progress ?? 0}%`,
    ]);
    exportTableToPDF('Instructor Cohort Student Roster', cols, rows, 'instructor_student_roster.pdf');
    toast.success('Student roster exported to PDF');
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'full_name',
      render: (s) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{s.full_name}</span>
            <Badge variant="indigo">{s.student_code}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{s.email}</p>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      render: (s) => <span className="text-xs text-slate-600">{s.phone || '—'}</span>,
    },
    {
      header: 'Enrolled Courses',
      accessor: 'enrolled_courses_count',
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {(s.enrolled_courses || []).map((ec, i) => (
            <Badge key={i} variant="slate">
              {ec.course_title}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Attendance %',
      accessor: 'attendance_percentage',
      render: (s) => (
        <Badge variant={(s.attendance_percentage ?? 100) >= 75 ? 'green' : 'amber'}>
          {s.attendance_percentage ?? 100}%
        </Badge>
      ),
    },
    {
      header: 'Completion Progress',
      accessor: 'avg_progress',
      render: (s) => (
        <div className="w-40">
          <ProgressBar
            value={s.avg_progress || 0}
            showValue={true}
            size="sm"
            color={(s.avg_progress || 0) >= 75 ? 'emerald' : 'indigo'}
          />
        </div>
      ),
    },
    {
      header: 'Profile',
      render: (s) => (
        <Button
          size="sm"
          variant="outline"
          icon={Eye}
          onClick={() => setSelectedStudent(s)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Student Roster"
        subtitle="Directory of all students enrolled across your assigned courses and batches with live attendance and progress metrics."
        badge={<Badge variant="indigo">{students.length} Students</Badge>}
        actions={
          students.length > 0 && (
            <Button variant="outline" icon={Download} onClick={handleExportPDF}>
              Export Roster PDF
            </Button>
          )
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search student by name, email, or student ID..."
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
        <Loader text="Filtering student roster..." />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          emptyTitle="No students match your filter"
          emptyDescription="Try clearing the course or batch filter to view all students in your cohorts."
        />
      )}

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.full_name || 'Student Profile'}
        subtitle={`Student ID: ${selectedStudent?.student_code || ''} • ${selectedStudent?.email || ''}`}
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedStudent.phone || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400">Attendance Rate</p>
                <p className="font-extrabold text-emerald-700 mt-0.5">
                  {selectedStudent.attendance_percentage ?? 100}%
                </p>
              </div>
              <div>
                <p className="text-slate-400">Average Completion</p>
                <p className="font-extrabold text-[#4F46E5] mt-0.5">
                  {selectedStudent.avg_progress ?? 0}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Course Enrollments & Completion
              </h4>
              {(selectedStudent.enrolled_courses || []).map((ec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ec.course_title}</p>
                      <p className="text-xs text-slate-500">
                        Batch: {ec.batch_name || 'Direct Cohort'}
                      </p>
                    </div>
                    <StatusBadge status={ec.status} />
                  </div>
                  <ProgressBar value={ec.completion_percentage || 0} label="Course Progress" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
