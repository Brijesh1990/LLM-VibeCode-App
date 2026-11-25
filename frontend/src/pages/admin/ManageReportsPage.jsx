import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { courseService } from '../../services/courseService';
import { batchService } from '../../services/batchService';
import { API_BASE_URL } from '../../constants';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';

export default function ManageReportsPage() {
  const [reportType, setReportType] = useState('enrollment');
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [search, setSearch] = useState('');
  const [reportData, setReportData] = useState({ title: '', items: [] });
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    courseService.listCourses().then((r) => setCourses(r.items || []));
    batchService.listBatches().then((r) => setBatches(r.items || []));
  }, []);

  const loadReport = async () => {
    try {
      const res = await reportService.getAnalyticsReport({
        report_type: reportType,
        course_id: courseId || undefined,
        batch_id: batchId || undefined,
        search: search || undefined,
      });
      setReportData(res);
    } catch {
      toast.error('Failed to generate report.');
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, courseId, batchId, search]);

  const triggerBackendExport = (fmt) => {
    const token = localStorage.getItem('lms_access_token');
    const params = new URLSearchParams({
      report_type: reportType,
      export: fmt,
      token: token || '',
    });
    if (courseId) params.append('course_id', courseId);
    if (batchId) params.append('batch_id', batchId);
    if (search) params.append('search', search);
    window.open(`${API_BASE_URL}/reports/analytics?${params.toString()}`, '_blank');
  };

  const columns =
    reportData.items?.length > 0
      ? Object.keys(reportData.items[0]).map((k) => ({ header: k, accessor: k }))
      : [{ header: 'Result', accessor: 'Info' }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Reports & Multi-Format Export Center"
        subtitle="Generate live database reports and export in CSV, Excel (.xlsx), or ReportLab PDF formats"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => triggerBackendExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => triggerBackendExport('xlsx')}
            >
              Export Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              icon={FileText}
              onClick={() => triggerBackendExport('pdf')}
            >
              Export ReportLab PDF
            </Button>
          </>
        }
      />

      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Select
          label="Report Category"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="enrollment">Student Enrollment Report</option>
          <option value="course_performance">Course & Batch Performance</option>
          <option value="attendance">Attendance & Eligibility Report</option>
          <option value="assignments">Assignment Evaluation Report</option>
          <option value="quizzes">Quiz Examination Performance</option>
          <option value="revenue">Revenue & Tuition Collection</option>
          <option value="pending_fees">Pending Fee Defaulters Report</option>
        </Select>

        <Select
          label="Filter by Course"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>

        <Select
          label="Filter by Batch"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Search Within Report
          </label>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Filter rows..."
          />
        </div>
      </div>

      <DataTable
        data={reportData.items || []}
        columns={columns}
        pageSize={12}
      />
    </div>
  );
}
