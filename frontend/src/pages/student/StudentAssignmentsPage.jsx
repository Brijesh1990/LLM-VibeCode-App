import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileCheck2,
  Calendar,
  Award,
  Upload,
  CheckCircle2,
  Clock,
  Inbox,
} from 'lucide-react';
import { assignmentService } from '../../services/assignmentService';
import { batchService } from '../../services/batchService';
import { formatDateTime } from '../../utils/formatters';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatusBadge from '../../components/common/StatusBadge';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';

export default function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [asgRes, enrRes] = await Promise.all([
        assignmentService.listAssignments(),
        batchService.listEnrollments(),
      ]);
      setAssignments(asgRes.items || []);
      setEnrollments(enrRes.items || []);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchCourse = !courseFilter || String(a.course_id) === String(courseFilter);
      const subStatus = a.my_submission ? a.my_submission.status : 'pending';
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'pending' && !a.my_submission) ||
        (statusFilter === 'submitted' && a.my_submission && subStatus !== 'evaluated') ||
        (statusFilter === 'evaluated' && subStatus === 'evaluated');
      const matchSearch =
        !search ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.course_title?.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase());
      return matchCourse && matchStatus && matchSearch;
    });
  }, [assignments, courseFilter, statusFilter, search]);

  const columns = [
    {
      header: 'Assignment',
      accessor: 'title',
      render: (a) => (
        <div>
          <p className="font-bold text-slate-900">{a.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{a.description}</p>
        </div>
      ),
    },
    {
      header: 'Course & Module',
      accessor: 'course_title',
      render: (a) => (
        <div>
          <p className="font-semibold text-slate-800">{a.course_title}</p>
          <p className="text-xs text-slate-500">{a.module_title || a.batch_name || 'All Batches'}</p>
        </div>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'due_date',
      render: (a) => {
        const isOverdue = a.due_date && new Date(a.due_date) < new Date() && !a.my_submission;
        return (
          <div className="text-xs">
            <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-800'}`}>
              {formatDateTime(a.due_date)}
            </p>
            <p className="text-slate-400">
              {a.allow_late_submission ? 'Late allowed' : 'Strict deadline'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Marks',
      accessor: 'max_marks',
      render: (a) => (
        <div className="text-xs">
          {a.my_submission?.marks_obtained != null ? (
            <span className="font-extrabold text-emerald-700">
              {a.my_submission.marks_obtained} / {a.max_marks}
            </span>
          ) : (
            <span className="font-semibold text-slate-700">
              Max: {a.max_marks} (Pass: {a.passing_marks})
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Submission Status',
      render: (a) => (
        <StatusBadge status={a.my_submission ? a.my_submission.status : 'pending'} />
      ),
    },
    {
      header: 'Action',
      render: (a) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={a.my_submission ? 'outline' : 'primary'}
            icon={a.my_submission ? CheckCircle2 : Upload}
            onClick={() => navigate(`/student/assignments/${a.id}/submit`)}
          >
            {a.my_submission ? 'View / Resubmit' : 'Submit Assignment'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loader text="Loading your course assignments..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Course Assignments"
        subtitle="Review assignment requirements, track submission deadlines, and upload your project solutions."
        badge={<Badge variant="indigo">{assignments.length} Total</Badge>}
        actions={
          <Button
            variant="outline"
            icon={Inbox}
            onClick={() => navigate('/student/submissions')}
          >
            View Submission History & Feedback
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search assignments by title or course..."
        />
        <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Enrolled Courses</option>
          {enrollments.map((e) => (
            <option key={e.course_id} value={e.course_id}>
              {e.course_title}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending Submission</option>
          <option value="submitted">Submitted (Awaiting Evaluation)</option>
          <option value="evaluated">Evaluated & Graded</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredAssignments}
        emptyTitle="No assignments found"
        emptyDescription="You have no assignments matching the selected filter criteria."
      />
    </div>
  );
}
